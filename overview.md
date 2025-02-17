### docker-compose.yml docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - arelle_service
    networks:
      - app-network

  frontend:
    build: 
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    volumes:
      - ./client:/app
      - /app/node_modules # don't do it build them in container 
    environment:
      - NODE_ENV=development
    depends_on:
      - backend

  arelle_service:
    build: ./arelle_service
    ports:
      - "8001:8000"  # Expose on a different host port if needed
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

### END docker-compose.yml

### app.py arelle_service\app.py
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import os
import shutil
import json
import logging

logger = logging.getLogger("uvicorn.error")
logger.setLevel(logging.DEBUG)

# Assuming your convert function and required imports are in a module named convert_module
from arelle_fun import convert

app = FastAPI()

@app.post("/convert/")
async def convert_file(file: UploadFile = File(...)):
    # Define the paths for the uploaded file and the output JSON in the main directory
    logger.debug("Convert endpoint called")
    main_dir = os.path.dirname(os.path.abspath(__file__))
    logger.debug("main_dir = " + main_dir)
    upload_path = os.path.join(main_dir, file.filename).replace("\\", "/")
    logger.debug("upload_path = " + upload_path)
    json_output_path = os.path.join(main_dir, 'file.json').replace("\\", "/")
    logger.debug("json_output_path = " + json_output_path)

    logger.debug("Saving upload file")

    # Save the uploaded file
    with open(upload_path, 'wb') as buffer:
        shutil.copyfileobj(file.file, buffer)

    logger.debug("File saved")

    # Construct the command arguments
    command = [
        '-f', upload_path,
        '--plugins', 'validate/EFM|saveLoadableOIM',
        f'--saveLoadableOIM={json_output_path}'
    ]

    logger.debug("Calling conversion")

    # Call the convert function
    try:
        convert(command)
        logger.debug("Conversion successful")
    except Exception as e:
        logger.error("An error occurred during conversion:", e)
        os.remove(upload_path)
        os.remove(json_output_path)
        return JSONResponse(content={"error": "An error occurred during conversion"})

    logger.debug("Reading generated JSON file")

    # Read the generated JSON file
    with open(json_output_path, 'r') as json_file:
        json_content = json_file.read()

    logger.debug("Read the content")

    logger.debug("Cleaning up files")

    # Optionally, clean up the uploaded file and the JSON output if you don't want to keep them
    os.remove(upload_path)
    os.remove(json_output_path)

    logger.debug("Files cleaned")

    logger.debug("Returned the results")

    # Return the JSON content as a response
    return JSONResponse(content=json.loads(json_content))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

### END app.py

### arelle_fun.py arelle_service\arelle_fun.py
import os
import sys
import logging

logger = logging.getLogger("uvicorn.error")
logger.setLevel(logging.DEBUG)

# Only imports for modules distributed as part of the standard Python library may go above this line.
# All other imports will result in module not found exceptions on the frozen macOS build.
if sys.platform == "darwin" and getattr(sys, 'frozen', False):
    for i in range(len(sys.path)):  # signed code can't contain python modules
        sys.path.append(sys.path[i].replace("MacOS", "Resources"))

import regex as re

from arelle.SocketUtils import INTERNET_CONNECTIVITY, OFFLINE, warnSocket
from arelle.BetaFeatures import BETA_OBJECT_MODEL_FEATURE, enableNewObjectModel
from arelle import CntlrCmdLine, CntlrComServer


def convert(args):
    logger.debug("convert() called")
    internetConnectivityArgPattern = rf'--({INTERNET_CONNECTIVITY}|{INTERNET_CONNECTIVITY.lower()})'
    internetConnectivityArgRegex = re.compile(internetConnectivityArgPattern)
    internetConnectivityOfflineEqualsRegex = re.compile(f"{internetConnectivityArgPattern}={OFFLINE}")
    prevArg = ''
    for arg in args:
        if (
                internetConnectivityOfflineEqualsRegex.fullmatch(arg)
                or (internetConnectivityArgRegex.fullmatch(prevArg) and arg == OFFLINE)
        ):
            warnSocket()
            break
        prevArg = arg
    # Model transition must be enabled before any other imports to avoid mixing base classes.
    if f"--{BETA_OBJECT_MODEL_FEATURE}" in args or f"--{BETA_OBJECT_MODEL_FEATURE.lower()}" in args:
        logger.debug("Enabling new object model")
        enableNewObjectModel()

    if '--COMserver' in args:
        logger.debug("Turning on com server")
        CntlrComServer.main()
    elif __name__.startswith('_mod_wsgi_') or os.getenv('wsgi.version'):
        logger.debug("Turning on wsgi application")
        application = CntlrCmdLine.wsgiApplication()
    elif __name__ in ('__main__', 'arelleCmdLine__main__', 'arellecmdline__main__','arelle_fun'): #cx_Freeze 5 prepends module name to __main__
        logger.debug("running command line")
        os.environ["ARELLE_ARGS"] = ' '.join(args)
        logger.debug(os.getenv("ARELLE_ARGS"))

        logger.debug("Calling main")

        CntlrCmdLine.main()

        logger.debug("main() finished")

### END arelle_fun.py

### Dockerfile arelle_service\Dockerfile
# Use an official Python runtime as a parent image
FROM python:3.12.0-alpine
# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Expose port 8001 to allow traffic
EXPOSE 8001

# Run the FastAPI app with Uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001"]

### END Dockerfile

### .env.example backend\.env.example
OPENAI_API_KEY=YourOpenaiKey
ASSISTANT_ID=YourAssistantID
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
ARELLE_URL=http://arelle_service

### END .env.example

### app.py backend\app.py
import os
import shutil
import uuid
import traceback
from typing import Dict
from urllib.parse import parse_qs
from openai import OpenAI
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, File, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import requests
import json
import threading
import asyncio
import queue  # Add this import
from chat_service import AssistantService

app = FastAPI()

# Allow CORS
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000')
origins = cors_origins.split(',')

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    print(f"Unhandled exception: {exc}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error"},
        media_type="application/json"
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
        media_type="application/json"
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={"error": exc.errors()},
        media_type="application/json"
    )

uploaded_data = {}

class ConnectionManager:
    def __init__(self, assistant_service: AssistantService):
        self.active_connections: Dict[WebSocket, dict] = {}
        self.assistant_service = assistant_service

    async def connect(self, websocket: WebSocket, user_id: str):
        """
        On connect, we create 2 threads:
          1) preloaded_thread -> used for 'preloaded' mode
          2) file_search_thread -> used for 'user_json' or 'converted_xbrl' mode
        We'll store them in the connection dictionary.
        """
        preloaded_thread = self.assistant_service.create_thread()
        file_search_thread = self.assistant_service.create_file_search_thread()

        self.active_connections[websocket] = {
            'user_id': user_id,
            'mode': 'preloaded',  # default mode
            'preloaded_thread_id': preloaded_thread.id,
            'file_search_thread_id': file_search_thread.id,
            'file_uploaded': False
        }

        await websocket.accept()

    def disconnect(self, websocket: WebSocket):
        self.active_connections.pop(websocket, None)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_json({"type": "personal_message", "message": message})

    async def broadcast_status(self, user_id: str, message: str):
        websocket = None
        for ws, info in self.active_connections.items():
            if info['user_id'] == user_id:
                websocket = ws
                break
        if websocket:
            await self.send_personal_message(f"[STATUS_UPDATE]: {message}", websocket)
        else:
            print(f"No active WebSocket connection for user_id {user_id}")

    # --- NEW/CHANGED CODE ---
    def set_mode(self, websocket: WebSocket, new_mode: str):
        """
        Allows switching the mode for the given connection: 
         'preloaded' | 'user_json' | 'converted_xbrl'
        """
        if websocket in self.active_connections:
            self.active_connections[websocket]['mode'] = new_mode

    def get_mode(self, websocket: WebSocket) -> str:
        if websocket in self.active_connections:
            return self.active_connections[websocket].get('mode', 'preloaded')
        return 'preloaded'

    def get_thread_for_mode(self, websocket: WebSocket) -> str:
        """
        Returns the correct thread_id depending on the current mode.
        """
        conn = self.active_connections.get(websocket)
        if not conn:
            return None

        mode = conn['mode']
        if mode == 'preloaded':
            return conn['preloaded_thread_id']
        else:
            # 'user_json' or 'converted_xbrl'
            return conn['file_search_thread_id']

    async def process_message(self, ws: WebSocket, message: str, use_enhanced_context: bool = False):
        conn = self.active_connections.get(ws)
        if not conn:
            raise Exception("Connection not found")
        thread_id = self.get_thread_for_mode(ws)
        mode = conn['mode']
        return await self.assistant_service.process_message(
            message, mode=mode, thread_id=thread_id, use_enhanced_context=use_enhanced_context
        )

assistant_service = AssistantService()
manager = ConnectionManager(assistant_service)

@app.get("/")
async def read_root():
    return JSONResponse(
        content={"message": "Welcome to the API. Use the endpoints to upload, convert or chat."},
        media_type="application/json"
    )

# --------------------------------------------------------------
#  Original XBRL /upload endpoint (kept as is)
# --------------------------------------------------------------
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Original logic to convert XBRL to JSON using arelle, store result in memory.
    This does NOT attach the file to the assistant yet.
    """
    user_id = str(uuid.uuid4())
    upload_dir = "uploaded_files"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, f"{user_id}_{file.filename}")

    with open(file_path, 'wb') as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        arelle_url = os.getenv('ARELLE_URL', 'http://localhost:8001')
        with open(file_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(f'{arelle_url}/convert/', files=files)
            response.raise_for_status()
            json_data = response.json()

        uploaded_data[user_id] = json_data

        converted_dir = "converted_files"
        os.makedirs(converted_dir, exist_ok=True)
        json_file_path = os.path.join(converted_dir, f"{user_id}.json")
        with open(json_file_path, 'w', encoding='utf-8') as json_file:
            json.dump(json_data, json_file, ensure_ascii=False, indent=4)

        os.remove(file_path)

        # The user must pass user_id to the ws to associate the newly converted JSON
        return JSONResponse(
            content={
                "message": "File uploaded and converted successfully",
                "user_id": user_id
            },
            status_code=200,
            media_type="application/json"
        )
    except Exception as e:
        print(f"Error during conversion: {e}")
        traceback.print_exc()
        try:
            os.remove(file_path)
        except:
            pass
        return JSONResponse(
            content={"error": f"An error occurred during conversion: {str(e)}"},
            status_code=500,
            media_type="application/json"
        )

# --------------------------------------------------------------
#  NEW Endpoint: /upload_json_file
#    - user directly uploads a JSON file to be used by the "file_search" assistant
# --------------------------------------------------------------
@app.post("/upload_json_file")
async def upload_json_file(
    file: UploadFile = File(...)
):
    """
    The user provides a JSON file, we store it, create a vector store, attach to the 
    'file_search' assistant or to a new thread. 
    """
    try:
        # 1) Save the file locally (optional step, or read in-memory)
        user_id = str(uuid.uuid4())
        upload_dir = "user_json_files"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, f"{user_id}_{file.filename}")

        with open(file_path, 'wb') as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 2) Create a vector store for this new file
        vector_store = assistant_service.create_vector_store(name="User JSON Upload")

        # 3) Upload the file to OpenAI, link it to the vector store
        with open(file_path, 'rb') as fstream:
            file_batch = assistant_service.upload_files_to_vector_store(
                vector_store_id=vector_store.id, 
                file_streams=[fstream]
            )

        # 4) Return the vector store ID to the client, so client can attach it
        return JSONResponse(
            content={
                "message": "JSON file uploaded and processed successfully.",
                "user_id": user_id,
                "vector_store_id": vector_store.id
            },
            status_code=200
        )
    except Exception as e:
        print(f"Error: {e}")
        traceback.print_exc()
        return JSONResponse(
            content={"error": f"Unable to process file: {str(e)}"},
            status_code=500
        )

# --------------------------------------------------------------
#  NEW Endpoint: /upload_and_convert_xbrl
#    - user uploads XBRL, we do the arelle conversion, then 
#      create a vector store and attach the result to the 
#      second assistant or the user's file_search_thread.
# --------------------------------------------------------------
@app.post("/upload_and_convert_xbrl")
async def upload_and_convert_xbrl(file: UploadFile = File(...)):
    """
    1) Convert XBRL to JSON
    2) Create a vector store
    3) Upload the new JSON to the vector store
    4) Return the vector_store_id to the user
    """
    try:
        # Convert to JSON first
        user_id = str(uuid.uuid4())
        upload_dir = "uploaded_files"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, f"{user_id}_{file.filename}")

        with open(file_path, 'wb') as buffer:
            shutil.copyfileobj(file.file, buffer)

        arelle_url = os.getenv('ARELLE_URL', 'http://localhost:8001')
        with open(file_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(f'{arelle_url}/convert/', files=files)
            response.raise_for_status()
            json_data = response.json()

        os.remove(file_path)

        # Save to a temp .json to upload to vector store
        temp_json_dir = "converted_files"
        os.makedirs(temp_json_dir, exist_ok=True)
        json_file_path = os.path.join(temp_json_dir, f"{user_id}.json")
        with open(json_file_path, 'w', encoding='utf-8') as jf:
            json.dump(json_data, jf, ensure_ascii=False, indent=4)

        # Create vector store
        vector_store = assistant_service.create_vector_store(name="Converted XBRL File")

        # Upload the newly created JSON
        with open(json_file_path, 'rb') as fstream:
            file_batch = assistant_service.upload_files_to_vector_store(
                vector_store_id=vector_store.id,
                file_streams=[fstream]
            )

        # Return the vector_store_id
        return JSONResponse(
            content={
                "message": "XBRL converted and uploaded to vector store successfully.",
                "user_id": user_id,
                "vector_store_id": vector_store.id
            },
            status_code=200
        )
    except Exception as e:
        print(f"Error during XBRL convert and vector store creation: {e}")
        traceback.print_exc()
        return JSONResponse(
            content={"error": str(e)},
            status_code=500
        )

# --------------------------------------------------------------
#  NEW Endpoint: /attach_vector_store_to_thread
#    - let the client attach the returned vector_store to 
#      that user's "file_search_thread"
#    - then switch the mode
# --------------------------------------------------------------
@app.post("/attach_vector_store_to_thread")
async def attach_vector_store_to_thread(
    websocket_user_id: str = Form(...),
    vector_store_id: str = Form(...)
):
    """
    The frontend will call this after it receives the vector_store_id from either 
    /upload_json_file or /upload_and_convert_xbrl 
    to attach it to the user's "file_search_thread" 
    and automatically switch mode to 'user_json' or 'converted_xbrl'.
    """
    # We find the active websocket for that user_id
    ws_to_update = None
    for ws, info in manager.active_connections.items():
        if info['user_id'] == websocket_user_id:
            ws_to_update = ws
            break

    if not ws_to_update:
        return JSONResponse(
            content={"error": "No active websocket found for that user_id."},
            status_code=400
        )

    # Attach the vector store to the file_search_thread
    file_search_thread_id = manager.active_connections[ws_to_update]['file_search_thread_id']
    updated_thread = assistant_service.attach_vector_store_to_thread(file_search_thread_id, vector_store_id)

    # Switch the user's mode to 'converted_xbrl' or 'user_json'. 
    # For simplicity, let’s just set 'converted_xbrl' if we want to force them to that mode,
    # or 'user_json' if this was a JSON file. You can pass it from the Form if you want to differentiate.
    manager.set_mode(ws_to_update, 'converted_xbrl')

    return JSONResponse(
        content={
            "message": "Vector store attached successfully. Mode switched to 'converted_xbrl'.",
            "thread_id": file_search_thread_id
        },
        status_code=200
    )

# --------------------------------------------------------------
#  NEW Endpoint: /switch_mode
#    - let the user choose 'preloaded' or 'user_json' or 'converted_xbrl'
# --------------------------------------------------------------
@app.post("/switch_mode")
async def switch_mode_endpoint(
    websocket_user_id: str = Form(...),
    new_mode: str = Form(...)
):
    ws_to_update = None
    for ws, info in manager.active_connections.items():
        if info['user_id'] == websocket_user_id:
            ws_to_update = ws
            break
    if not ws_to_update:
        return JSONResponse(
            content={"error": "No active websocket found for that user_id."},
            status_code=400
        )

    if new_mode not in ["preloaded", "user_json", "converted_xbrl"]:
        return JSONResponse(
            content={"error": "Invalid mode provided."},
            status_code=400
        )

    manager.set_mode(ws_to_update, new_mode)
    return {"message": f"Mode switched to {new_mode}."}

# --------------------------------------------------------------
#  Original /data/{user_id} endpoint
# --------------------------------------------------------------
@app.get("/data/{user_id}")
async def get_converted_data(user_id: str):
    json_data = uploaded_data.get(user_id)
    if json_data:
        return JSONResponse(
            content=json_data,
            media_type="application/json"
        )
    else:
        return JSONResponse(
            content={"error": "Data not found for the provided user_id."},
            status_code=404,
            media_type="application/json"
        )

# --------------------------------------------------------------
#  WebSocket Endpoint
# --------------------------------------------------------------
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    user_id = websocket.query_params.get("user_id", str(uuid.uuid4()))
    await manager.connect(websocket, user_id=user_id)

    while True:
        try:
            data = await websocket.receive_json()
            message = data.get("message", "")
            use_enhanced_context = data.get("enhancedContext", False)

            response = await manager.process_message(websocket, message, use_enhanced_context)
            await websocket.send_json({"type": "message", "message": response})

        except WebSocketDisconnect:
            print("Client disconnected")
            manager.disconnect(websocket)
            break
        except Exception as e:
            print(f"Error processing message: {e}")
            traceback.print_exc()
            try:
                await websocket.send_json({"error": "An error occurred while processing the message."})
            except WebSocketDisconnect:
                print("Client disconnected")
                break

### END app.py

### chat_service.py backend\chat_service.py
# chat_service.py
import openai
import os
from dotenv import load_dotenv
import json

load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")
assistant_id = os.getenv("ASSISTANT_ID")  # Original usage
conversion_assistant_id = os.getenv("CONVERSION_ASSISTANT_ID")  # For file-search usage

openai.api_key = openai_api_key

class AssistantService:
    def __init__(self):
        # Initialize the OpenAI client
        self.client = openai.OpenAI()
        self.assistant_id = assistant_id               # The "preloaded" usage
        self.file_search_assistant_id = conversion_assistant_id  # The "file search" usage

        self.enhanced_context = None
        self._load_enhanced_context()

    def _load_enhanced_context(self):
        try:
            with open('esrs_data/enhanced_report.json', 'r') as file:
                self.enhanced_context = json.load(file)
        except Exception as e:
            print(f"Error loading enhanced context: {e}")
            self.enhanced_context = None

    # ---------------------------------------------
    # Helper to create a "regular" thread with the original assistant
    # ---------------------------------------------
    def create_thread(self):
        thread = self.client.beta.threads.create()
        return thread

    def add_user_message(self, thread_id, content):
        message = self.client.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=content
        )
        return message

    def run_assistant(self, thread_id):
        run = self.client.beta.threads.runs.create_and_poll(
            thread_id=thread_id,
            assistant_id=self.assistant_id
        )
        return run

    # ---------------------------------------------
    # Helper to create a thread that references the "file search" assistant
    # ---------------------------------------------
    def create_file_search_thread(self):
        thread = self.client.beta.threads.create()
        return thread

    # Because we have 2 different assistant_ids, we may want a separate run method
    def run_file_search_assistant(self, thread_id):
        run = self.client.beta.threads.runs.create_and_poll(
            thread_id=thread_id,
            assistant_id=self.file_search_assistant_id
        )
        return run

    # ---------------------------------------------
    # Utility: get the last assistant message text from a thread
    # ---------------------------------------------
    def get_latest_assistant_message(self, thread_id):
        messages = self.client.beta.threads.messages.list(thread_id=thread_id)
        # Print message IDs and roles for debugging
        print("Messages in thread:")
        for msg in messages.data:
            print(f"Message ID: {msg.id}, Role: {msg.role}")

        # We assume messages.data is newest to oldest
        for message in messages.data:
            if message.role == 'assistant':
                content_text = ''
                if isinstance(message.content, list):
                    for content_item in message.content:
                        if isinstance(content_item, dict) and content_item.get('type') == 'text':
                            content_text += content_item.get('text', {}).get('value', '')
                        elif isinstance(content_item, str):
                            content_text += content_item
                elif isinstance(message.content, str):
                    content_text = message.content
                return content_text
        return None

    # ---------------------------------------------
    # MAIN message processing logic 
    # ---------------------------------------------
    async def process_message(
        self, 
        message: str, 
        mode: str = "preloaded",   # "preloaded" | "user_json" | "converted_xbrl"
        thread_id: str = None, 
        use_enhanced_context: bool = False
    ):
        """
        mode = 
          - 'preloaded' => use self.assistant_id 
          - 'user_json' => use self.file_search_assistant_id 
          - 'converted_xbrl' => also use self.file_search_assistant_id 
        """
        try:
            if use_enhanced_context and self.enhanced_context:
                message = f"{message}\n\nESRS Context: {json.dumps(self.enhanced_context)}"

            # Add user message
            self.add_user_message(thread_id, message)

            # Depending on the mode, run with the appropriate assistant
            if mode == "preloaded":
                run = self.run_assistant(thread_id)
            else:
                # For both user_json or converted_xbrl, we call the "file_search" assistant
                run = self.run_file_search_assistant(thread_id)

            if run.status == "completed":
                response = self.get_latest_assistant_message(thread_id)
                return response
        except Exception as e:
            print(f"Error processing message: {e}")

    # ---------------------------------------------
    # File Search helpers:
    #  1) Create a vector store
    #  2) Upload files to that vector store
    #  3) Attach it to the "file_search" assistant or to a thread
    # ---------------------------------------------
    def create_vector_store(self, name="User Provided Files"):
        vector_store = self.client.beta.vector_stores.create(name=name)
        return vector_store

    def upload_files_to_vector_store(self, vector_store_id, file_streams):
        """
        file_streams is a list of file-like objects (or an array of open files).
        We use the helper upload_and_poll to ensure processing is complete.
        """
        file_batch = self.client.beta.vector_stores.file_batches.upload_and_poll(
            vector_store_id=vector_store_id,
            files=file_streams
        )
        return file_batch

    def attach_vector_store_to_assistant(self, vector_store_id):
        # Attach to the "file_search" assistant
        updated = self.client.beta.assistants.update(
            assistant_id=self.file_search_assistant_id,
            tool_resources={"file_search": {"vector_store_ids": [vector_store_id]}}
        )
        return updated

    def attach_vector_store_to_thread(self, thread_id, vector_store_id):
        # We can update the thread so the file_search tool has it
        updated_thread = self.client.beta.threads.update(
            thread_id=thread_id,
            tool_resources={"file_search": {"vector_store_ids": [vector_store_id]}}
        )
        return updated_thread

### END chat_service.py

### Dockerfile backend\Dockerfile
# backend/Dockerfile

FROM python:3.10-alpine
# not good for JS projects
WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]

### END Dockerfile
### fill_esrs.py backend\utils\fill_esrs.py
import json
import os
import re  # for the simplify_tag_number regex

# ----------------------------------------------------------------------------------------
# Helper functions to handle references from ESRS or other relevant documents
# (as provided in the reference snippet).
# ----------------------------------------------------------------------------------------

ESRS_DIRECTORY = os.path.join(os.path.dirname(__file__), '..', 'esrs_data')

def simplify_tag_number(tag_number):
    """
    Extract only the first integer in the tag_number.
    For example:
        "11 c SBM-3" -> "11"
        "10 b SBM-3" -> "10"
    If no integer is found, returns the original tag_number unchanged.
    """
    m = re.search(r'^(\d+)', tag_number.strip())
    if m:
        return m.group(1)
    return tag_number  # fallback: no digits found at start

def reference_endpoint(reference):
    """
    Endpoint to process the 'references' field only if it mentions ESRS and use the ESRS documents.
    Adds a 'reference' key in the result so you can see the exact references being processed.
    """
    if 'ESRS' in reference:
        parsed_references = parse_reference(reference)
        if parsed_references:
            results = []
            for parsed_ref in parsed_references:
                result = get_esrs_text(parsed_ref)
                # Build a combined reference string: "ESRS S2 11 c SBM-3" for example
                full_ref_str = f"{parsed_ref.get('document')} {parsed_ref.get('tag_number')}".strip()
                
                if result:
                    # Add 'reference' to the found result
                    result["reference"] = full_ref_str
                    results.append(result)
                else:
                    # Insert 'reference' so you know which ref was not found
                    results.append({
                        "message": f"Tag not found in {parsed_ref.get('document')} (or no text for '{parsed_ref.get('tag_number')}')",
                        "reference": full_ref_str
                    })
            return {"results": results}
        else:
            return {"results": None}
    else:
        # If the reference does not mention ESRS, do not process it
        return {"results": None}

def parse_reference(reference):
    """
    Parses the reference string into structured components, processing only references that mention ESRS.
    Example of reference string: " ESRS ESRS 2 3 BP-1, ESRS E1 41 "
    """
    references = [ref.strip() for ref in reference.strip().split(',') if ref.strip()]
    parsed_list = []
    for ref in references:
        if 'ESRS' in ref:
            parts = ref.strip().split()
            parsed = {}
            # Minimal check: must start with "ESRS"
            if parts[0] == 'ESRS':
                # We might have "ESRS ESRS 2 41" or "ESRS E1 41"
                if len(parts) >= 3:
                    if parts[1] == 'ESRS':
                        # e.g. "ESRS ESRS 2 3 BP-1"
                        document = f"{parts[1]} {parts[2]}"  # "ESRS 2"
                        tag_number = ' '.join(parts[3:])
                    else:
                        # e.g. "ESRS E1 41"
                        document = f"{parts[0]} {parts[1]}"  # "ESRS E1"
                        tag_number = ' '.join(parts[2:])
                    parsed = {
                        "standard": parts[0],
                        "document": document,
                        "tag_number": tag_number
                    }
                else:
                    parsed = {"reference": ref}
                parsed_list.append(parsed)
            else:
                parsed = {"reference": ref}
                parsed_list.append(parsed)
        else:
            # references not mentioning ESRS are ignored
            continue
    return parsed_list

def get_esrs_text(parsed_ref):
    """
    Retrieves the text corresponding to the 'tag_number' in the ESRS 'document'.
    Looks up JSON files in the ESRS_DIRECTORY (mapped by map_document_to_filename).
    """

    document = parsed_ref.get('document')
    original_tag_number = parsed_ref.get('tag_number')

    if not document or not original_tag_number:
        return None

    # If you want to strip off trailing text:
    # "ESRS S2 11 c SBM-3" -> "ESRS S2 11"
    # you can simplify the tag_number here:
    simplified_num = simplify_tag_number(original_tag_number)
    # Now reconstruct the full tag to search in your JSON data
    # Example: "ESRS S2" + " " + "11" -> "ESRS S2 11"
    full_tag = f"{document} {simplified_num}".strip()

    filename = map_document_to_filename(document)
    if not filename:
        return {"message": f"Document {document} not found in file mapping."}

    file_path = os.path.join(ESRS_DIRECTORY, filename)
    if not os.path.exists(file_path):
        return {"message": f"File for {document} not found: {filename}"}

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            esrs_data = json.load(f)
    except Exception as e:
        return {"message": f"Error reading {filename}: {str(e)}"}

    # Now we search for "ESRS S2 11" (for example) in esrs_data
    for item in esrs_data:
        if item.get('tag') == full_tag:
            return {
                "document": document,
                "tag": full_tag,
                "text": item.get('text')
            }

    # If no match is found, return None
    return None

def map_document_to_filename(document):
    """
    Maps the ESRS document identifier to the corresponding JSON file name.
    Adjust as needed if more mappings are introduced.
    """
    document_mapping = {
        'ESRS 1': 'ESRS_1.json',
        'ESRS 2': 'ESRS_2.json',
        'ESRS E1': 'ESRS_E1.json',
        'ESRS E2': 'ESRS_E2.json',
        'ESRS E3': 'ESRS_E3.json',
        'ESRS E4': 'ESRS_E4.json',
        'ESRS E5': 'ESRS_E5.json',
        'ESRS S1': 'ESRS_S1.json',
        'ESRS S2': 'ESRS_S2.json',
        'ESRS S3': 'ESRS_S3.json',
        'ESRS S4': 'ESRS_S4.json',
        'ESRS G1': 'ESRS_G1.json',
    }
    return document_mapping.get(document)

# ----------------------------------------------------------------------------------------
# The find_concept and find_concept_group functions, as provided in the snippet.
# ----------------------------------------------------------------------------------------

def find_concept(data, tag):
    """
    Recursively find the concept list containing the specified tag in the data (presentation).
    data is typically a nested combination of lists/dicts representing the taxonomy structure.
    """
    if isinstance(data, list):
        # Check if the list is a "concept" definition
        if len(data) >= 2 and data[0] == "concept":
            concept_data = data[1]
            if isinstance(concept_data, dict) and concept_data.get("name") == tag:
                return data
        # Otherwise keep drilling down
        for item in data:
            result = find_concept(item, tag)
            if result:
                return result
    elif isinstance(data, dict):
        # If dictionary, we check all values recursively
        for value in data.values():
            result = find_concept(value, tag)
            if result:
                return result
    return None

def find_concept_group(data, tag):
    """
    Finds a concept and its concept group within the 'presentation' array, by searching for a concept named `tag`.
    Returns (concept_found, group_found).
    - concept_found: the list starting with "concept" if found
    - group_found: the item in the "presentation" list where the concept was found
    """
    data_list = data.get('presentation', [])
    if isinstance(data_list, list):
        for item in data_list:
            # Try to find the concept within this item
            result = find_concept(item, tag)
            if result:
                # 'item' is the "group" that encloses that concept
                return (result, item)
    return (None, None)

# ----------------------------------------------------------------------------------------
# Main function that:
# 1) Iterates the ESRS facts (like in the user's "filled ESRS RAPORT")
# 2) Extracts the concept name
# 3) Finds the concept in the "presentation" data (like the ESRS taxonomy snapshot)
# 4) Extracts references for that concept
# 5) Saves them in a new key "esrs_data_reference" in the fact dictionary
# ----------------------------------------------------------------------------------------

def enhance_report_with_esrs_references(report_data, esrs_reference_snapshot):
    """
    Goes through each fact in report_data["facts"], finds the concept in the esrs_reference_snapshot,
    retrieves the references, and creates a new key "esrs_data_reference" in that fact.
    """
    # Loop through each fact in the report
    for fact_id, fact_content in report_data.get("facts", {}).items():
        # 1) Extract the concept name from the 'dimensions'
        dimensions = fact_content.get("dimensions", {})
        concept_name = dimensions.get("concept")
        if not concept_name:
            continue

        # 2) Find the concept and concept group from the snapshot
        found_concept, found_group = find_concept_group(esrs_reference_snapshot, concept_name)

        # 3) If we found the concept, let's try to extract references from the concept definition
        references_data = None
        if found_concept and len(found_concept) >= 3:
            concept_details = found_concept[2]
            if isinstance(concept_details, dict):
                references_data = concept_details.get("references")

        # 4) Use reference_endpoint to parse and get actual references from ESRS if any
        if references_data:
            reference_info = reference_endpoint(references_data)
        else:
            reference_info = {"results": None}

        # 5) Construct an object to store as "esrs_data_reference"
        esrs_data_reference = {
            "concept": concept_name,
            "concept_group": None,
            "parsed_references": reference_info["results"]
        }

        # If we want to store info about the group
        if isinstance(found_group, list) and len(found_group) >= 2:
            group_role_def = found_group[1]
            if isinstance(group_role_def, dict):
                concept_group_role = group_role_def.get("role")
                concept_group_definition = group_role_def.get("definition")
                if concept_group_role or concept_group_definition:
                    esrs_data_reference["concept_group"] = {
                        "role": concept_group_role,
                        "definition": concept_group_definition
                    }

        # 6) Attach esrs_data_reference to the fact
        fact_content["esrs_data_reference"] = esrs_data_reference

    return report_data


# ----------------------------------------------------------------------------------------
# Example usage / main entry point
# ----------------------------------------------------------------------------------------

if __name__ == "__main__":
    try:
        # 1) Load an example filled report (replace with your file path)
        with open(os.path.join(ESRS_DIRECTORY, 'example_filled.json'), 'r', encoding='utf-8') as f:
            report_data = json.load(f)
            
        # 2) Load the ESRS reference snapshot (replace with your file path)
        with open(os.path.join(ESRS_DIRECTORY, 'esrs_json.json'), 'r', encoding='utf-8') as f:
            esrs_reference_snapshot = json.load(f)
            
        # 3) Call the enhance function
        enhanced_report = enhance_report_with_esrs_references(report_data, esrs_reference_snapshot)
        
        # 4) Save the enhanced report
        output_path = os.path.join(ESRS_DIRECTORY, 'enhanced_report.json')
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(enhanced_report, f, indent=4, ensure_ascii=False)
            
        print(f"Enhanced report saved to {output_path}")
            
    except FileNotFoundError as e:
        print(f"Error: Required file not found - {e}")
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON format - {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

### END fill_esrs.py

### find_concept_and_group.py backend\utils\find_concept_and_group.py
from pathlib import Path
import json
from find_concept_group import find_concept_group

# Get the path to the esrs_data directory relative to this file
ESRS_DATA_DIR = Path(__file__).parent.parent / 'esrs_data'
ESRS_JSON_PATH = ESRS_DATA_DIR / 'esrs_json.json'

def open_json():
    try:
        with ESRS_JSON_PATH.open('r', encoding='utf-8') as file:
            esrs_json = json.load(file)
        return esrs_json
    except FileNotFoundError:
        print(f"Error: Could not find file at {ESRS_JSON_PATH}")
        return None
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in file {ESRS_JSON_PATH}")
        return None

def get_concept_and_group(tag):
    """
    Retrieve the concept and its corresponding group based on the provided tag.
    Args:
        tag (str): The tag to search for in the data.
    Returns:
        dict: A dictionary containing the concept and its group. 
              If the concept and group are found, the dictionary will have the keys:
              - "concept": The found concept.
              - "concept_group": The group associated with the found concept.
              If not found, both keys will have the value None.
    """
    
    data = open_json()

    concept, group = find_concept_group(data, tag)
    if concept and group:
        return {"concept": concept, "concept_group": group}
    else:
        return {"concept": None, "concept_group": None}
### END find_concept_and_group.py

### find_concept_group.py backend\utils\find_concept_group.py


def find_concept(data, tag):
    """Recursively find the concept list containing the specified tag in the data."""
    if isinstance(data, list):
        # Check if the list represents a concept
        if len(data) >= 2 and data[0] == "concept":
            concept_data = data[1]
            if isinstance(concept_data, dict) and concept_data.get("name") == tag:
                return data
        # Recursively search in the list items
        for item in data:
            result = find_concept(item, tag)
            if result:
                return result
    elif isinstance(data, dict):
        # Recursively search in the dictionary values
        for value in data.values():
            result = find_concept(value, tag)
            if result:
                return result
    return None

def find_concept_group(data, tag):
    """
    Finds a concept and its concept group based on the given tag.

    Args:
        tag (str): The tag to search for.

    Returns:
        tuple: A tuple containing the concept and the concept group.
               The concept is the list starting with "concept" if found.
               The concept group is the item in the "presentation" list where the concept was found.
    """
    data_list = data.get('presentation', [])
    if isinstance(data_list, list):
        for item in data_list:
            result = find_concept(item, tag)
            if result:
                return result, item
    return (None, None)
### END find_concept_group.py

### find_reference.py backend\utils\find_reference.py
import os 
import json
ESRS_DIRECTORY = os.path.join(os.path.dirname(__file__), '..', 'esrs_data')

def reference_endpoint(reference):
    """
    Endpoint to process the 'references' field only if it mentions ESRS and use the ESRS documents.
    """
    if 'ESRS' in reference:
        parsed_references = parse_reference(reference)
        if parsed_references:
            results = []
            for parsed_ref in parsed_references:
                # Process each parsed reference
                result = get_esrs_text(parsed_ref)
                if result:
                    results.append(result)
                else:
                    results.append({"message": f"Tag not found in {parsed_ref.get('document')}"})
            return {"results": results}
        else:
            return {"results": None}
    else:
        # If the reference does not mention ESRS, do not process it
        return {"results": None}
    



def parse_reference(reference):
    """
    Parses the reference string into structured components, processing only references that mention ESRS.
    """
    # Split multiple references separated by commas
    references = [ref.strip() for ref in reference.strip().split(',') if ref.strip()]
    parsed_list = []
    for ref in references:
        if 'ESRS' in ref:
            parts = ref.strip().split()
            parsed = {}
            if parts[0] == 'ESRS':
                if len(parts) >= 3:
                    # Check if parts[1] is 'ESRS' (for 'ESRS ESRS 2 41')
                    if parts[1] == 'ESRS':
                        document = f"{parts[1]} {parts[2]}"  # 'ESRS 2'
                        tag_number = ' '.join(parts[3:])     # '41'
                    else:
                        document = f"{parts[0]} {parts[1]}"  # 'ESRS E2'
                        tag_number = ' '.join(parts[2:])     # '41'
                    parsed = {
                        "standard": parts[0],
                        "document": document,
                        "tag_number": tag_number
                    }
                else:
                    parsed = {"reference": ref}
                parsed_list.append(parsed)
            else:
                parsed = {"reference": ref}
                parsed_list.append(parsed)
        else:
            # Do not process references not mentioning ESRS
            continue
    return parsed_list


def get_esrs_text(parsed_ref):
    """
    Retrieves the text corresponding to the tag in the ESRS document.
    """
    document = parsed_ref.get('document')
    tag_number = parsed_ref.get('tag_number')

    if not document or not tag_number:
        return None

    # Map the document identifier to the file name
    filename = map_document_to_filename(document)
    if not filename:
        return {"message": f"Document {document} not found"}

    # Load the corresponding JSON file
    file_path = os.path.join(ESRS_DIRECTORY, filename)
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            esrs_data = json.load(f)
    except FileNotFoundError:
        return {"message": f"File {filename} not found"}

    # Search for the tag in the data
    full_tag = f"{document} {tag_number}"
    for item in esrs_data:
        if item.get('tag') == full_tag:
            return {
                "document": document,
                "tag": full_tag,
                "text": item.get('text')
            }

    # If tag not found
    return None

def map_document_to_filename(document):
    """
    Maps the ESRS document identifier to the corresponding JSON file name.
    """
    # Normalize the document name to match the file naming convention
    document_mapping = {
        'ESRS 1': 'ESRS_1.json',
        'ESRS 2': 'ESRS_2.json',
        'ESRS E1': 'ESRS_E1.json',
        'ESRS E2': 'ESRS_E2.json',
        'ESRS E3': 'ESRS_E3.json',
        'ESRS E4': 'ESRS_E4.json',
        'ESRS E5': 'ESRS_E5.json',
        'ESRS S1': 'ESRS_S1.json',
        'ESRS S2': 'ESRS_S2.json',
        'ESRS S3': 'ESRS_S3.json',
        'ESRS S4': 'ESRS_S4.json',
        'ESRS G1': 'ESRS_G1.json',
        # Add other mappings as needed
    }

    return document_mapping.get(document)
### END find_reference.py

### get_concept.py backend\utils\get_concept.py
import json
from find_concept_group import find_concept_group
import os

ESRS_DIRECTORY = os.path.join(os.path.dirname(__file__), '..', 'esrs_data')

def open_json():
    with open('esrs_json.json') as file:
        esrs_json = json.load(file)
    return esrs_json


def get_concept(tag: str):
    data = open_json()
    concept, group = find_concept_group(data, tag)
    if concept:
        return {"concept": concept}
    else:
        return {"concept": None}


### END get_concept.py

### .env.example client\.env.example
VITE_BACKEND_URL=http://localhost:8000
### END .env.example

### config.js client\config.js
globalThis.config = {
  "VITE_API_URL": "",
  "BACKEND_WS_ORIGIN": ""
};

### END config.js

### Dockerfile client\Dockerfile
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV BACKEND_WS_URL=ws://localhost:8000

EXPOSE 5173

CMD ["/bin/sh", "-c", "./run.sh"]

### END Dockerfile

### index.html client\index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="./config.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
### END index.html

### package.json client\package.json
{
    "name": "rest-express",
    "version": "1.0.0",
    "type": "module",
    "license": "MIT",
    "scripts": {
        "dev": "vite",
        "build": "vite build",
        "start": "vite",
        "preview": "vite preview"
    },
    "dependencies": {
        "@hookform/resolvers": "^3.9.1",
        "@jridgewell/trace-mapping": "^0.3.25",
        "@radix-ui/react-accordion": "^1.2.1",
        "@radix-ui/react-alert-dialog": "^1.1.2",
        "@radix-ui/react-aspect-ratio": "^1.1.0",
        "@radix-ui/react-avatar": "^1.1.1",
        "@radix-ui/react-checkbox": "^1.1.2",
        "@radix-ui/react-collapsible": "^1.1.1",
        "@radix-ui/react-context-menu": "^2.2.2",
        "@radix-ui/react-dialog": "^1.1.4",
        "@radix-ui/react-dropdown-menu": "^2.1.2",
        "@radix-ui/react-hover-card": "^1.1.2",
        "@radix-ui/react-label": "^2.1.0",
        "@radix-ui/react-menubar": "^1.1.2",
        "@radix-ui/react-navigation-menu": "^1.2.1",
        "@radix-ui/react-popover": "^1.1.2",
        "@radix-ui/react-progress": "^1.1.0",
        "@radix-ui/react-radio-group": "^1.2.1",
        "@radix-ui/react-scroll-area": "^1.2.0",
        "@radix-ui/react-select": "^2.1.2",
        "@radix-ui/react-separator": "^1.1.0",
        "@radix-ui/react-slider": "^1.2.1",
        "@radix-ui/react-slot": "^1.1.1",
        "@radix-ui/react-switch": "^1.1.1",
        "@radix-ui/react-tabs": "^1.1.2",
        "@radix-ui/react-toast": "^1.2.2",
        "@radix-ui/react-toggle": "^1.1.0",
        "@radix-ui/react-toggle-group": "^1.1.0",
        "@radix-ui/react-tooltip": "^1.1.3",
        "@replit/vite-plugin-shadcn-theme-json": "^0.0.4",
        "@tanstack/react-query": "^5.60.5",
        "@types/react-syntax-highlighter": "^15.5.13",
        "class-variance-authority": "^0.7.1",
        "clsx": "^2.1.1",
        "cmdk": "^1.0.0",
        "date-fns": "^3.6.0",
        "drizzle-orm": "^0.38.2",
        "drizzle-zod": "^0.6.0",
        "embla-carousel-react": "^8.3.0",
        "express": "^4.21.2",
        "express-session": "^1.18.1",
        "framer-motion": "^11.13.1",
        "input-otp": "^1.2.4",
        "lucide-react": "^0.453.0",
        "memorystore": "^1.6.7",
        "passport": "^0.7.0",
        "passport-local": "^1.0.0",
        "react": "^18.3.1",
        "react-day-picker": "^8.10.1",
        "react-dom": "^18.3.1",
        "react-hook-form": "^7.53.1",
        "react-icons": "^5.4.0",
        "react-markdown": "^9.0.3",
        "react-resizable-panels": "^2.1.4",
        "react-syntax-highlighter": "^15.6.1",
        "recharts": "^2.13.0",
        "remark-gfm": "^4.0.0",
        "tailwind-merge": "^2.6.0",
        "tailwindcss-animate": "^1.0.7",
        "vaul": "^1.1.0",
        "wouter": "^3.3.5",
        "ws": "^8.18.0",
        "zod": "^3.23.8"
    },
    "devDependencies": {
        "@replit/vite-plugin-runtime-error-modal": "^0.0.3",
        "@shadcn/ui": "^0.0.4",
        "@tailwindcss/typography": "^0.5.15",
        "@types/express": "4.17.21",
        "@types/express-session": "^1.18.0",
        "@types/node": "^20.17.12",
        "@types/passport": "^1.0.16",
        "@types/passport-local": "^1.0.38",
        "@types/react": "^18.3.18",
        "@types/react-dom": "^18.3.5",
        "@types/ws": "^8.5.13",
        "@vitejs/plugin-react": "^4.3.2",
        "autoprefixer": "^10.4.20",
        "cross-env": "^7.0.3",
        "drizzle-kit": "^0.27.1",
        "esbuild": "^0.24.0",
        "postcss": "^8.5.0",
        "tailwindcss": "^3.4.17",
        "tsx": "^4.19.1",
        "typescript": "^5.6.3",
        "vite": "^5.4.9"
    },
    "optionalDependencies": {
        "bufferutil": "^4.0.8"
    }
}

### END package.json

### postcss.config.js client\postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
} 
### END postcss.config.js

### run.sh client\run.sh
#!/bin/sh

cat << END > ./config.js
globalThis.config = {
  "VITE_API_URL": "${VITE_API_URL}",
  "BACKEND_WS_ORIGIN": "${BACKEND_WS_ORIGIN}"
};
END

exec npm run dev -- --host

### END run.sh

### tailwind.config.js client\tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} 
### END tailwind.config.js

### tsconfig.json client\tsconfig.json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
} 
### END tsconfig.json

### vite.config.ts client\vite.config.ts
import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}) 
### END vite.config.ts

### App.tsx client\src\App.tsx
import { Switch, Route } from "wouter";
import Home from "./pages/Home.jsx";
import { Card, CardContent } from "./components/ui/card";
import { AlertCircle } from "lucide-react";

function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            The page you're looking for doesn't exist.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;

### END App.tsx

### index.css client\src\index.css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply antialiased bg-background text-foreground;
    font-family: 'Poppins', sans-serif;
  }
}
### END index.css

### main.tsx client\src\main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "./components/ui/toaster";
import App from './App';
import "./index.css";
import "./styles/globals.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
);

### END main.tsx

### vite-env.d.ts client\src\vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 
### END vite-env.d.ts

### About.tsx client\src\components\About.tsx
import { Card, CardContent } from "./ui/card";

export default function About() {
  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">About XBRL Disclosure Explorer</h2>
          <p className="text-gray-600 mb-4">
            The XBRL Disclosure Explorer is a cutting-edge platform designed to revolutionize how organizations interact with European Sustainability Reporting Standards (ESRS) filings. Our tool makes sustainability reporting data more accessible, understandable, and actionable.
          </p>
          <div className="space-y-4">
            <section>
              <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
              <p className="text-gray-600">
                To democratize access to sustainability reporting data and empower organizations to make informed decisions about their environmental, social, and governance practices.
              </p>
            </section>
            <section>
              <h3 className="text-xl font-semibold mb-2">Key Features</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Advanced XBRL Processing</li>
                <li>Real-time Data Analysis</li>
                <li>Interactive Visualization Tools</li>
                <li>Natural Language Processing</li>
                <li>API Integration Capabilities</li>
              </ul>
            </section>
            <section>
              <h3 className="text-xl font-semibold mb-2">Technology Stack</h3>
              <p className="text-gray-600">
                Built with modern technologies including React, Flask, WebSocket for real-time processing, and advanced XBRL parsing capabilities. Our platform ensures high performance, reliability, and scalability.
              </p>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

### END About.tsx

### CardCarousel.tsx client\src\components\CardCarousel.tsx
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, FileSearch, ClipboardCheck, MessageSquare, Code2, BookOpen } from "lucide-react";
import EducationModal from "./EducationModal";

const cards = [
  {
    icon: <FileSearch className="h-8 w-8" />,
    title: "Explore ESRS Filings",
    description: "Learn about company ESG details and sustainability reporting",
    modalContent: "Dive deep into company Environmental, Social, and Governance (ESG) reporting through their ESRS filings. Understand how companies report their sustainability initiatives, environmental impact, social responsibility measures, and governance practices. Our tool helps you navigate through complex ESRS documents with ease, making sustainability data more accessible and comprehensible."
  },
  {
    icon: <ClipboardCheck className="h-8 w-8" />,
    title: "Understand ESRS Standard",
    description: "Navigate through different sections of ESRS filings",
    modalContent: "Master the European Sustainability Reporting Standards (ESRS) framework. Learn about different disclosure requirements including environmental standards (E1-E5), social standards (S1-S4), and governance standards (G1-G2). Understand how these standards shape corporate sustainability reporting and what information companies must disclose in each section."
  },
  {
    icon: <MessageSquare className="h-8 w-8" />,
    title: "Natural Language Chat",
    description: "Chat directly with filings and standards documentation",
    modalContent: "Interact with ESRS filings and standards documentation using natural language queries. Ask questions about specific disclosures, get clarification on reporting requirements, or explore sustainability metrics. Our AI-powered chat interface makes it easy to find and understand the information you need without navigating complex technical documents."
  },
  {
    icon: <Code2 className="h-8 w-8" />,
    title: "Open Source & API",
    description: "Build and extend using our open tools and API",
    modalContent: "Access our open-source tools and comprehensive API to build your own applications and extensions. Integrate ESRS data analysis into your workflows, create custom visualizations, or develop new features on top of our platform. Our well-documented API enables programmatic access to ESRS filings and analysis tools."
  },
  {
    icon: <BookOpen className="h-8 w-8" />,
    title: "ESRS & XBRL Guide",
    description: "Introduction to sustainability reporting standards",
    modalContent: "Get started with ESRS (European Sustainability Reporting Standards) and XBRL (eXtensible Business Reporting Language). Learn how these frameworks work together to standardize sustainability reporting, making it machine-readable and comparable across companies. Understand the importance of structured data in modern corporate reporting and how it enables better analysis of sustainability information."
  }
];

export default function CardCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <div className="relative py-16 px-6">
      <div className="flex items-center justify-center gap-6 overflow-hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={prevSlide}
          className="hidden md:flex"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory p-3 no-scrollbar">
          {cards.map((card, index) => (
            <Card
              key={index}
              className={`min-w-[250px] md:min-w-[300px] cursor-pointer transition-transform duration-200 hover:scale-105 snap-center
                ${index === currentIndex ? 'ring-2 ring-primary shadow-lg' : ''}`}
              onClick={() => setSelectedCard(index)}
            >
              <CardContent className="p-6">
                <div className="mb-4 text-primary">{card.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                <p className="text-sm text-gray-600">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={nextSlide}
          className="hidden md:flex"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <EducationModal
        isOpen={selectedCard !== null}
        onClose={() => setSelectedCard(null)}
        content={selectedCard !== null ? cards[selectedCard] : null}
      />
    </div>
  );
}
### END CardCarousel.tsx

### Chat.tsx client\src\components\Chat.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "./ui/card";
import LoadingDots from "./LoadingDots";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import EnhancedContextToggle from './EnhancedContextToggle';
import { useToast } from "../hooks/use-toast";

interface Message {
  text: string;
  isUser: boolean;
}

const WS_ORIGIN = globalThis.config?.BACKEND_WS_ORIGIN || 'ws://localhost:8000';

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [enhancedContext, setEnhancedContext] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const websocket = new WebSocket(`${WS_ORIGIN}/ws?user_id=${userId}`);

    websocket.onopen = () => {
      console.log('Connected to WebSocket');
    };

    websocket.onmessage = (event) => {
      setIsLoading(false);
      const message = event.data;
      console.log('Received message:', message);
      let data = null;
      try {
        data = JSON.parse(message);
        console.dir(data);
      } catch (error) {
        console.error('Failed to parse message:', error);
        return;
      }
      switch (data.type) {
        case 'message':
          setMessages(prev => [...prev, { text: data.message, isUser: false }]);
          break;
        case 'user_id':
          localStorage.setItem('userId', data.user_id);
          break;
        case 'personal_message':
          console.log('Personal message:', data.message);
          toast({
            title: "Personal message from server",
            description: data.message,
            duration: 3000,

          });
          break;
        case 'error':
          console.error('Server error:', data.error);
          toast({
            title: "Server error",
            description: data.error,
            variant: "destructive",
          });
          break;
        default:
          console.error('Invalid message type:', data.type);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !ws) return;

    setIsLoading(true);
    console.log('Sending message:', input);
    ws.send(JSON.stringify({ message: input }));
    setMessages(prev => [...prev, { text: input, isUser: true }]);
    setInput('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-xl font-semibold mb-4">Chat</h2>
        <EnhancedContextToggle
          isEnabled={enhancedContext}
          onToggle={(enabled) => setEnhancedContext(enabled)}
        />
        <div className="h-[400px] overflow-y-auto mb-4 p-4 border rounded-lg">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded-lg ${
                message.isUser
                  ? 'bg-blue-100 ml-auto max-w-[80%]'
                  : 'bg-gray-100 mr-auto max-w-[80%]'
              }`}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-md my-2"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code
                        className={`${inline ? 'bg-opacity-20 bg-gray-500 rounded px-1' :
                          'block bg-opacity-10 bg-gray-500 p-2 rounded-lg my-2'}`}
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  },
                  // Style links
                  a: ({ node, ...props }) => (
                    <a
                      className="text-blue-500 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    />
                  ),
                  // Style lists
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc ml-4 my-2" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal ml-4 my-2" {...props} />
                  ),
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>
          ))}
          {isLoading && <LoadingDots />}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Send
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
### END Chat.tsx

### Documentation.tsx client\src\components\Documentation.tsx
import { Card, CardContent } from "./ui/card";

export default function Documentation() {
  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Documentation</h2>
          
          <div className="space-y-6">
            <section>
              <h3 className="text-xl font-semibold mb-3">Getting Started</h3>
              <div className="prose text-gray-600">
                <p>Welcome to the XBRL Disclosure Explorer documentation. This guide will help you understand how to use our platform effectively.</p>
                
                <h4 className="text-lg font-medium mt-4 mb-2">Quick Start</h4>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Upload your XBRL file or use our mockup filing</li>
                  <li>Navigate through the interactive visualization</li>
                  <li>Use the chat interface to query your data</li>
                  <li>Export results in various formats</li>
                </ol>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">ESRS Standards</h3>
              <div className="prose text-gray-600">
                <p>The European Sustainability Reporting Standards (ESRS) are structured into three main categories:</p>
                
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>Environmental Standards (E1-E5)</li>
                  <li>Social Standards (S1-S4)</li>
                  <li>Governance Standards (G1-G2)</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-3">API Reference</h3>
              <div className="prose text-gray-600">
                <p>Our REST API enables programmatic access to all platform features. Authentication is required for API access.</p>
                
                <div className="bg-gray-50 p-4 rounded-md mt-2">
                  <code>GET /api/v1/filings</code>
                  <p className="mt-2">Retrieve a list of all available ESRS filings</p>
                </div>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

### END Documentation.tsx

### EducationModal.tsx client\src\components\EducationModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface EducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    title: string;
    modalContent: string;
    icon: React.ReactNode;
  } | null;
}

export default function EducationModal({ isOpen, onClose, content }: EducationModalProps) {
  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="text-primary">{content.icon}</span>
            <DialogTitle>{content.title}</DialogTitle>
          </div>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-700 leading-relaxed">
            {content.modalContent}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

### END EducationModal.tsx

### EnhancedContextToggle.tsx client\src\components\EnhancedContextToggle.tsx
import React from 'react';

interface EnhancedContextToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const EnhancedContextToggle: React.FC<EnhancedContextToggleProps> = ({ isEnabled, onToggle }) => {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={isEnabled}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
      </label>
      <span className="text-sm font-medium text-gray-900">Enhanced Context</span>
    </div>
  );
};

export default EnhancedContextToggle; 
### END EnhancedContextToggle.tsx

### FileUpload.tsx client\src\components\FileUpload.tsx
import React, { useState } from 'react';
import { Card, CardContent } from "./ui/card";
import { api } from '../lib/api';
import { useToast } from "../hooks/use-toast";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    setFile(e.target.files[0]);
    setLoading(true);

    try {
      const data = await api.upload(e.target.files[0]);
      localStorage.setItem('userId', data.user_id);

      toast({
        title: "Success",
        description: "File uploaded successfully!",
        duration: 3000,

      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Upload failed',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-xl font-semibold mb-4">Upload XBRL File</h2>
        <input
          type="file"
          onChange={handleFileUpload}
          accept=".xml,.xbrl,.zip"
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100"
        />
        {loading && (
          <div className="mt-2 text-blue-600">
            Uploading and processing file...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
### END FileUpload.tsx

### Hero.tsx client\src\components\Hero.tsx
import { Button } from "./ui/button";
import { ArrowDown } from "lucide-react";

export default function Hero() {
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section className="bg-gradient-to-br from-primary via-primary/90 to-[#3C9BDC] h-[80vh] min-h-[600px] flex items-center relative">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-sans">
            XBRL Disclosure Explorer for ESRS
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Navigate and analyze ESRS filings with AI assistance. Upload your XBRL documents for instant insights and compliance verification.
          </p>
          <div className="flex gap-4">
            <Button 
              onClick={scrollToContent}
              variant="secondary"
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
            >
              Explore ESRS
            </Button>
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white hover:text-white/80"
        onClick={scrollToContent}
      >
        <ArrowDown className="h-8 w-8 animate-bounce" />
      </Button>
    </section>
  );
}
### END Hero.tsx

### LoadingDots.tsx client\src\components\LoadingDots.tsx
export default function LoadingDots() {
  return (
    <div className="flex space-x-2 items-center text-gray-400">
      <span>AI is thinking</span>
      <span className="flex space-x-1">
        <span className="animate-bounce delay-0">.</span>
        <span className="animate-bounce delay-150">.</span>
        <span className="animate-bounce delay-300">.</span>
      </span>
    </div>
  );
} 
### END LoadingDots.tsx

### button.tsx client\src\components\ui\button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

### END button.tsx

### card.tsx client\src\components\ui\card.tsx
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(" flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

### END card.tsx

### dialog.tsx client\src\components\ui\dialog.tsx
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = ({
  className,
  children,
  ...props
}: DialogPrimitive.DialogPortalProps) => (
  <DialogPrimitive.Portal className={cn(className)} {...props}>
    <div className="fixed inset-0 z-50 flex items-start justify-center sm:items-center">
      {children}
    </div>
  </DialogPrimitive.Portal>
)
DialogPortal.displayName = DialogPrimitive.Portal.displayName

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-100 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 grid w-full gap-4 rounded-b-lg border bg-background p-6 shadow-lg animate-in data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-bottom-10 sm:max-w-lg sm:rounded-lg sm:zoom-in-90 data-[state=open]:sm:slide-in-from-bottom-0",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}

### END dialog.tsx

### tabs.tsx client\src\components\ui\tabs.tsx
import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "../../lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent } 
### END tabs.tsx

### toast.tsx client\src\components\ui\toast.tsx
import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}

### END toast.tsx

### toaster.tsx client\src\components\ui\toaster.tsx
import { useToast } from "../../hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

### END toaster.tsx

### use-mobile.tsx client\src\hooks\use-mobile.tsx
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

### END use-mobile.tsx

### use-toast.ts client\src\hooks\use-toast.ts
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "../components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }

### END use-toast.ts

### api.ts client\src\lib\api.ts
const API_BASE_URL =
  globalThis?.config?.VITE_API_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";

export const api = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });
    return response.json();
  },

  chat: async (message: string, userId: string) => {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, user_id: userId }),
    });
    return response.json();
  },
};

### END api.ts

### queryClient.ts client\src\lib\queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const res = await fetch(queryKey[0] as string, {
          credentials: "include",
        });

        if (!res.ok) {
          if (res.status >= 500) {
            throw new Error(`${res.status}: ${res.statusText}`);
          }

          throw new Error(`${res.status}: ${await res.text()}`);
        }

        return res.json();
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    }
  },
});

### END queryClient.ts

### utils.ts client\src\lib\utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

### END utils.ts

### .gitkeep client\src\pages\.gitkeep

### END .gitkeep

### Home.tsx client\src\pages\Home.tsx
import React, { useState } from 'react';
import CardCarousel from "../components/CardCarousel";
import FileUpload from "../components/FileUpload";
import Chat from "../components/Chat";
import About from "../components/About";
import Documentation from "../components/Documentation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import Hero from "../components/Hero";

function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Hero />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs defaultValue="chat" className="w-full p-6 bg-muted rounded-lg">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="space-y-6">
            <CardCarousel />
            <FileUpload />
            <Chat />
          </TabsContent>

          <TabsContent value="about">
            <About />
          </TabsContent>

          <TabsContent value="docs">
            <Documentation />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default Home;
### END Home.tsx

### globals.css client\src\styles\globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
 
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
 
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
 
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
 
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
 
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
 
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
 
    --radius: 0.5rem;
  }
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
} 

@layer utilities {
  .delay-150 {
    animation-delay: 150ms;
  }
  .delay-300 {
    animation-delay: 300ms;
  }
} 
### END globals.css

