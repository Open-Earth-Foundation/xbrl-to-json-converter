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

app = FastAPI()

# Allow CORS for the frontend origin
# TODO: Change to the actual frontend origin once it is deployed
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000')
origins = cors_origins.split(',')

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

    def __init__(self, assistant_service: AssistantService):
        self.active_connections: Dict[WebSocket, dict] = {}
        self.assistant_service = assistant_service

    async def connect(self, websocket: WebSocket, user_id: str):
        thread = self.assistant_service.create_thread()
        thread_id = thread.id

        # Store additional metadata including the file_uploaded flag
        self.active_connections[websocket] = {
            'user_id': user_id,
            'thread_id': thread_id,
            'file_uploaded': False
        }

    def disconnect(self, websocket: WebSocket):
        self.active_connections.pop(websocket, None)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_json({"type": "personal_message", "message": message})

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

    async def process_message(
        self, ws: WebSocket, message: str, use_enhanced_context: bool = False
    ):
        conn = self.active_connections.get(ws)
        if not conn:
            raise Exception("Connection not found")
        user_id = conn["user_id"]
        thread_id = conn["thread_id"]
        return await self.assistant_service.process_message(
            message, thread_id, use_enhanced_context
        )


# Import the AI function
assistant_service = AssistantService()
manager = ConnectionManager(assistant_service)

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
        arelle_url = os.getenv('ARELLE_URL', 'http://localhost:8001')
        with open(file_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(f'{arelle_url}/convert/', files=files)
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

        # Update the file_uploaded flag for the user's websocket connection
        for ws, connection_info in manager.active_connections.items():
            if connection_info['user_id'] == user_id:
                connection_info['file_uploaded'] = True
                # Optionally notify the client that the file is ready
                await manager.send_personal_message("[FILE_READY]", ws)
                break

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

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    user_id = websocket.query_params.get("user_id")

    await manager.connect(websocket, user_id=user_id)

    while True:
        try:
            data = await websocket.receive_json()
            print(f"Received data: {data}")
            message = data.get("message", "")
            print(f"Message: {message}")
            use_enhanced_context = data.get("enhancedContext", False)

            response = await manager.process_message(
                websocket, message, use_enhanced_context
            )

            await websocket.send_json({"type": "message", "message": response})
        except WebSocketDisconnect:
            print("Client disconnected")
            break
        except Exception as e:
            print(f"Error processing message: {e}")
            traceback.print_exc()
            try:
                await websocket.send_json(
                    {"error": "An error occurred while processing the message."}
                )
            except WebSocketDisconnect:
                print("Client disconnected")
                break
