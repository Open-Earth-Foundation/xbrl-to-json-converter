# backend/app.py

import os
import shutil
import uuid
import traceback
from typing import Dict
from openai import OpenAI
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, File, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import requests
import json
import asyncio
import threading
import queue
import logging

from chat_service import AssistantService

app = FastAPI()

# Add these lines at the top after imports
logging.getLogger("multipart.multipart").setLevel(logging.WARNING)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# CORS
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000')
origins = cors_origins.split(',')

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global error handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    print(f"Unhandled exception: {exc}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error"},
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={"error": exc.errors()},
    )

# Just if you want to store data in memory
uploaded_data = {}

#######################################################
# ConnectionManager
#######################################################
class ConnectionManager:
    def __init__(self, assistant_service: AssistantService):
        self.active_connections: Dict[WebSocket, dict] = {}
        self.assistant_service = assistant_service
        logger.info("ConnectionManager initialized")

    async def connect(self, websocket: WebSocket, user_id: str):
        """
        On connect, create:
          - preloaded_thread for the original assistant
          - file_search_thread for the second assistant
        """
        logger.info(f"New connection request from user_id: {user_id}")
        
        # Create threads and store their IDs
        thread = self.assistant_service.create_thread()
        file_search_thread = self.assistant_service.create_thread()
        
        logger.info(f"Created threads - Preloaded: {thread.id}, File Search: {file_search_thread.id}")

        self.active_connections[websocket] = {
            'user_id': user_id,
            'mode': 'preloaded',
            'preloaded_thread_id': thread.id,
            'file_search_thread_id': file_search_thread.id,
            'file_uploaded': False
        }
        logger.info(f"Stored connection info for user {user_id}")

        await websocket.accept()
        logger.info(f"WebSocket connection accepted for user {user_id}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.pop(websocket, None)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_json({"type": "personal_message", "message": message})

    def set_mode(self, websocket: WebSocket, new_mode: str):
        """Switch the mode for a connection between 'preloaded' and file search modes."""
        if websocket in self.active_connections:
            old_mode = self.active_connections[websocket]['mode']
            self.active_connections[websocket]['mode'] = new_mode
            user_id = self.active_connections[websocket]['user_id']
            logger.info(f"User {user_id}: Switched mode from {old_mode} to {new_mode}")
            return True
        return False

    def get_mode(self, websocket: WebSocket) -> str:
        if websocket in self.active_connections:
            return self.active_connections[websocket].get('mode', 'preloaded')
        return 'preloaded'

    def get_thread_for_mode(self, websocket: WebSocket) -> str:
        conn = self.active_connections.get(websocket)
        if not conn:
            return None
        mode = conn['mode']
        if mode == 'preloaded':
            return conn['preloaded_thread_id']
        else:
            return conn['file_search_thread_id']

    async def broadcast_status(self, user_id: str, message: str):
        """
        Optional: broadcast status updates to a user's websocket
        """
        websocket = None
        for ws, info in self.active_connections.items():
            if info['user_id'] == user_id:
                websocket = ws
                break
        if websocket:
            await self.send_personal_message(f"[STATUS_UPDATE]: {message}", websocket)
        else:
            print(f"No active WebSocket connection for user_id {user_id}")

    async def process_message(self, websocket: WebSocket, message: str):
        """
        Process a message from the websocket.
        If mode is 'preloaded', use the preloaded thread.
        If mode is 'user_json' (or similar), use the file_search thread.
        """
        try:
            info = self.active_connections[websocket]
            current_mode = info['mode']
            print(f"Processing message in mode: {current_mode}")
            
            if current_mode == "preloaded":
                thread_id = info['preloaded_thread_id']
                print(f"Using preloaded thread: {thread_id}")
                response = await self.assistant_service.send_message(message, thread_id, mode="preloaded")
            elif current_mode in ["user_json", "converted_xbrl"]:
                thread_id = info['file_search_thread_id']
                print(f"Using file search thread: {thread_id} with mode: {current_mode}")
                response = await self.assistant_service.send_message(message, thread_id, mode=current_mode)
            else:
                response = "Error: Invalid mode"
            
            if not response:
                print("Warning: Empty response received")
                response = "No response received from assistant"
            
            print(f"Final response to send: {response[:100]}...")
            return response
        except Exception as e:
            print(f"Error in process_message: {e}")
            traceback.print_exc()
            return f"Error processing message: {str(e)}"



assistant_service = AssistantService()
manager = ConnectionManager(assistant_service)

#######################################################
# Root
#######################################################
@app.get("/")
async def read_root():
    return JSONResponse({"message": "Hello from the XBRL/JSON upload API"})

#######################################################
# The original XBRL endpoint, unchanged
#######################################################
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Original logic to convert XBRL -> JSON using Arelle, store in memory if you want,
    but also keep it for the user in "converted_files" folder, etc.
    Then do your vector store logic, attach to second assistant, etc.

    (Leaving everything exactly as you had it.)
    """
    user_id = str(uuid.uuid4())
    upload_dir = "uploaded_files"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, f"{user_id}_{file.filename}")

    # Save the file
    with open(file_path, 'wb') as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Call Arelle
        arelle_url = os.getenv('ARELLE_URL', 'http://localhost:8001')
        with open(file_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(f'{arelle_url}/convert/', files=files)
            response.raise_for_status()
            json_data = response.json()

        # (Store in memory, if you want)
        uploaded_data[user_id] = json_data

        # Save locally
        converted_dir = "converted_files"
        os.makedirs(converted_dir, exist_ok=True)
        json_file_path = os.path.join(converted_dir, f"{user_id}.json")
        with open(json_file_path, 'w', encoding='utf-8') as jf:
            json.dump(json_data, jf, ensure_ascii=False, indent=4)

        os.remove(file_path)  # cleanup original


        return JSONResponse(
            {"message": "XBRL File uploaded & converted successfully", "user_id": user_id},
            status_code=200
        )
    except Exception as e:
        traceback.print_exc()
        try:
            os.remove(file_path)
        except:
            pass
        return JSONResponse({"error": str(e)}, status_code=500)

#######################################################
# The new JSON endpoint
#######################################################
@app.post("/upload_json_file")
async def upload_json_file(file: UploadFile = File(...), websocket_user_id: str = Form(...)):
    """
    Handle JSON file upload and assistant switching:
    1) Accept user-uploaded JSON
    2) Create vector store from it
    3) Attach to user's 'file_search_thread'
    4) Switch mode to 'user_json'
    """
    try:
        logger.info(f"Starting file upload process for user {websocket_user_id}")
        logger.info(f"File name: {file.filename}")

        if not websocket_user_id:
            websocket_user_id = str(uuid.uuid4())
            logger.info(f"Generated new user ID: {websocket_user_id}")

        # Save file locally
        upload_dir = "user_json_files"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, f"{websocket_user_id}_{file.filename}")
        logger.info(f"Saving file to: {file_path}")

        # Use async file operations
        contents = await file.read()
        with open(file_path, 'wb') as f:
            f.write(contents)
        logger.info("File saved successfully")

        # Create vector store & attach
        logger.info("Creating vector store")
        vector_store = assistant_service.create_vector_store(
            name=f"User JSON for {websocket_user_id}"
        )
        logger.info(f"Vector store created: {vector_store.id}")
        
        # Upload file to vector store
        logger.info("Uploading file to vector store")
        with open(file_path, 'rb') as fstream:
            file_batch = assistant_service.upload_files_to_vector_store(vector_store.id, [fstream])
            logger.info(f"File batch uploaded: {file_batch.id}")

        # Clean up the temporary file
        os.remove(file_path)
        logger.info("Temporary file cleaned up")

        # Find the user's websocket connection
        ws_found = None
        for ws, info in manager.active_connections.items():
            if info['user_id'] == websocket_user_id:
                ws_found = ws
                logger.info(f"Found websocket connection for user {websocket_user_id}")
                break

        if ws_found:
            file_search_thread_id = manager.active_connections[ws_found]['file_search_thread_id']
            logger.info(f"Attaching vector store to thread {file_search_thread_id}")
            assistant_service.attach_vector_store_to_thread(file_search_thread_id, vector_store.id)
            
            # Switch mode to user_json
            logger.info("Switching mode to user_json")
            manager.set_mode(ws_found, "user_json")
            
            return JSONResponse(content={
                "message": "File processed successfully",
                "vector_store_id": vector_store.id,
                "thread_id": file_search_thread_id
            })
        else:
            logger.warning(f"No active websocket connection found for user {websocket_user_id}")
            return JSONResponse(
                content={"error": "No active connection found"},
                status_code=400
            )

    except Exception as e:
        logger.error(f"Error processing file upload: {str(e)}")
        traceback.print_exc()
        return JSONResponse(
            content={"error": f"Failed to process file: {str(e)}"},
            status_code=500
        )

#######################################################
# Switching mode
#######################################################
@app.post("/switch_mode")
async def switch_mode_endpoint(
    websocket_user_id: str = Form(...),
    new_mode: str = Form(...)
):
    """
    e.g. preloaded -> user_json -> converted_xbrl
    """
    ws_to_update = None
    for ws, info in manager.active_connections.items():
        if info['user_id'] == websocket_user_id:
            ws_to_update = ws
            break

    if not ws_to_update:
        return JSONResponse({"error": "No active websocket found."}, status_code=400)

    if new_mode not in ["preloaded", "user_json", "converted_xbrl"]:
        return JSONResponse({"error": "Invalid mode."}, status_code=400)

    manager.set_mode(ws_to_update, new_mode)
    return JSONResponse({"message": f"Mode switched to {new_mode}."})

#######################################################
# Example data retrieval
#######################################################
@app.get("/data/{user_id}")
async def get_converted_data(user_id: str):
    """
    If you want to retrieve the JSON from memory for a given user_id
    """
    json_data = uploaded_data.get(user_id)
    if json_data:
        return JSONResponse(json_data)
    else:
        return JSONResponse({"error": "Data not found."}, status_code=404)

#######################################################
# WebSocket Endpoint
#######################################################
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    user_id = websocket.query_params.get("user_id", str(uuid.uuid4()))
    await manager.connect(websocket, user_id=user_id)

    while True:
        try:
            data = await websocket.receive_json()
            message = data.get("message", "")

            response = await manager.process_message(websocket, message)
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
