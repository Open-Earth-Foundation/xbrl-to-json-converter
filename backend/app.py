import os
import shutil
import uuid
import traceback
from typing import Dict
from urllib.parse import parse_qs
from openai import OpenAI
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, File, UploadFile
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
# Import the AI function
assistant_service = AssistantService()

app = FastAPI()

# Allow CORS for the frontend origin
origins = [
    "http://localhost:3000",
]

# Add the CORS middleware before any routes or other middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Only allow requests from the specified origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handlers to ensure CORS headers are included even on errors
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

# In-memory storage (replace with database in production)
uploaded_data = {}

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
            # Create a new Thread for the user
            thread = assistant_service.create_thread()
            thread_id = thread.id

            # Store the user_id and thread_id for this connection
            self.active_connections[websocket] = {'user_id': user_id, 'thread_id': thread_id}

    def disconnect(self, websocket: WebSocket):
        self.active_connections.pop(websocket, None)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast_status(self, user_id: str, message: str):
        websocket = None
        for ws, uid in self.active_connections.items():
            if uid == user_id:
                websocket = ws
                break

        if websocket:
            await self.send_personal_message(f"[STATUS_UPDATE]: {message}", websocket)
        else:
            print(f"No active WebSocket connection for user_id {user_id}")

manager = ConnectionManager()

# Root endpoint
@app.get("/")
async def read_root():
    return JSONResponse(
        content={"message": "Welcome to the API. Use the /upload endpoint to upload files."},
        media_type="application/json"
    )

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    user_id = str(uuid.uuid4())
    upload_dir = "uploaded_files"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, f"{user_id}_{file.filename}")

    # Save the uploaded file temporarily
    with open(file_path, 'wb') as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Send the file to the arelle_service
    try:
        with open(file_path, 'rb') as f:
            files = {'file': f}
            response = requests.post('http://localhost:8001/convert/', files=files)
            response.raise_for_status()
            json_data = response.json()

        # Store the converted data using user_id as the key
        uploaded_data[user_id] = json_data

        # Save the converted JSON data to a file with user_id as the filename
        converted_dir = "converted_files"
        os.makedirs(converted_dir, exist_ok=True)
        json_file_path = os.path.join(converted_dir, f"{user_id}.json")
        with open(json_file_path, 'w', encoding='utf-8') as json_file:
            json.dump(json_data, json_file, ensure_ascii=False, indent=4)

        # Clean up the uploaded file
        os.remove(file_path)

        # Return success response without json_data
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
        except Exception as e_remove:
            print(f"Error removing file: {e_remove}")
        # Return error response with status code 500
        return JSONResponse(
            content={"error": f"An error occurred during conversion: {str(e)}"},
            status_code=500,
            media_type="application/json"
        )

# Endpoint to retrieve converted data
@app.get("/data/{user_id}")
async def get_converted_data(user_id: str):
    # Retrieve from in-memory storage
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

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    try:
        query_params = parse_qs(websocket.scope['query_string'].decode())
        user_id = query_params.get('user_id', [None])[0]

        if not user_id:
            user_id = str(uuid.uuid4())
            await websocket.send_text(f"[USER_ID]: {user_id}")

        await manager.connect(websocket, user_id=user_id)

        while True:
            data = await websocket.receive_text()
            await process_message(data, websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"Error: {e}")
        traceback.print_exc()
        await websocket.close()

async def process_message(message: str, websocket: WebSocket):
    try:
        connection_info = manager.active_connections.get(websocket)
        if not connection_info:
            await websocket.send_text("Error: Connection not found.")
            return

        thread_id = connection_info['thread_id']

        # Add the user's message to the Thread
        assistant_service.add_user_message(thread_id, message)

        # Run the Assistant on the Thread in a thread to avoid blocking
        run = await asyncio.to_thread(assistant_service.run_assistant, thread_id)

        if run.status == 'completed':
            # Get the Assistant's latest message
            assistant_message = assistant_service.get_latest_assistant_message(thread_id)
            if assistant_message:
                await manager.send_personal_message(assistant_message, websocket)
            else:
                await manager.send_personal_message("Error: No assistant response.", websocket)
        else:
            await manager.send_personal_message(f"Error: Run failed with status {run.status}", websocket)
    except Exception as e:
        print(f"Error processing message: {e}")
        traceback.print_exc()
        await manager.send_personal_message("Error: Unable to process your request.", websocket)