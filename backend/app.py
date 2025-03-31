# backend/app.py

import io
import logging
import os
import sys
import traceback

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, File, UploadFile, Form
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

app = FastAPI()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)

logger = logging.getLogger("app")
logger.setLevel(logging.INFO)

logger.info("Backend application initialized and ready to receive requests")

load_dotenv()

# CORS
cors_origins = os.getenv('CORS_ORIGINS',
                         'http://localhost:5173,http://localhost:3000,https://xbrl-to-json.openearth.dev')
origins = cors_origins.split(',')

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/test")
async def test_endpoint():
    logger.info("Test endpoint was called successfully")
    print("DIRECT PRINT: Test endpoint was called")  # This will definitely show in logs
    return {"status": "ok", "message": "Test endpoint working"}


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


#######################################################
# Root
#######################################################
@app.get("/")
async def read_root():
    return JSONResponse({"message": "Hello NINA from the XBRL/JSON converter"})


#######################################################
# The original XBRL endpoint - CHANGED to accept user ID
#######################################################
@app.post("/upload_file")
async def upload_file(
        file: UploadFile = File(...),
        websocket_user_id: str = Form(...)
):
    logger.info("upload_file endpoint called")
    user_id = websocket_user_id
    logger.info(f"Received upload request from user: {user_id} with file: {file.filename}")

    try:
        # Read the file content directly from the uploaded file
        file_content = await file.read()

        # Call Arelle service
        arelle_url = os.getenv('ARELLE_URL', 'http://xbrl-to-json-converter_arelle_service_1:8001')
        logger.info(f"Calling Arelle service at {arelle_url}")

        # Create files dictionary with BytesIO to avoid temporary file creation
        files = {
            'file': (file.filename, io.BytesIO(file_content), 'application/zip')
        }

        headers = {
            'Accept': 'application/json'
        }

        # Send the request to Arelle service
        response = requests.post(f'{arelle_url}/convert/',  files=files, headers=headers)
        response.raise_for_status()
        json_data = response.json()
        logger.info("File successfully converted by Arelle service")

        return JSONResponse(
            {
                "message": "XBRL File uploaded & converted successfully",
                "json_data": json_data
            },
            status_code=200
        )

    except Exception as e:
        logger.error(f"Error during file upload and conversion: {e}")
        traceback.print_exc()
        return JSONResponse({"error": str(e)}, status_code=500)
