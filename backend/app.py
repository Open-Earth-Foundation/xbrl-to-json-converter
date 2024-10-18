import os
import shutil
import uuid
import traceback
from typing import Dict
from urllib.parse import parse_qs

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import requests
import json  # Import json module

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

# Connection Manager to handle WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[websocket] = user_id

    def disconnect(self, websocket: WebSocket):
        self.active_connections.pop(websocket, None)

    def get_user_id(self, websocket: WebSocket) -> str:
        return self.active_connections.get(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

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
            media_type="application/json"  # No Content-Disposition header
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
            media_type="application/json"  # No Content-Disposition header
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

# Modify the WebSocket endpoint to include user_id
@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    query_params = parse_qs(websocket.scope['query_string'].decode())
    user_id = query_params.get('user_id', [None])[0]

    if not user_id:
        await websocket.close(code=1008, reason="User ID not provided")
        return

    await manager.connect(websocket, user_id=user_id)
    try:
        while True:
            data = await websocket.receive_text()
            await process_message(data, websocket, user_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"Error: {e}")
        traceback.print_exc()
        await websocket.close()

# Update process_message to use the user's uploaded data
async def process_message(message: str, websocket: WebSocket, user_id: str):
    try:
        json_data = uploaded_data.get(user_id)
        if not json_data:
            await manager.send_personal_message(
                "Error: No data found for this user. Please upload a document first.", websocket
            )
            await manager.send_personal_message("[STREAM_END]", websocket)
            return

        # Implement logic to handle the message using json_data
        # For simplicity, let's just echo the message back
        await manager.send_personal_message(f"Echo: {message}", websocket)
        await manager.send_personal_message("[STREAM_END]", websocket)
    except Exception as e:
        print(f"Error processing message: {e}")
        traceback.print_exc()
        await manager.send_personal_message(
            "Error: Unable to process your request.", websocket
        )
        await manager.send_personal_message("[STREAM_END]", websocket)
