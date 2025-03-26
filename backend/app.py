# backend/app.py

import json
import logging
import os
import shutil
import traceback

import requests
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, File, UploadFile, Form
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from dotenv import load_dotenv

app = FastAPI()

logging.getLogger("multipart.multipart").setLevel(logging.WARNING)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# CORS
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000,https://xbrl-converter.openearth.dev')
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

#######################################################
# Root
#######################################################
@app.get("/")
async def read_root():
    return JSONResponse({"message": "Hello from the XBRL/JSON converter"})


#######################################################
# The original XBRL endpoint - CHANGED to accept user ID
#######################################################
@app.post("/upload_file")
async def upload_file(
        file: UploadFile = File(...),
        websocket_user_id: str = Form(...)
):
    user_id = websocket_user_id
    upload_dir = "uploaded_files"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, f"{user_id}_{file.filename}")

    # Save the file
    with open(file_path, 'wb') as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Call Arelle
        arelle_url_env = os.getenv('ARELLE_URL')
        print(arelle_url_env, "arelle_url_env")
        arelle_url = os.getenv('ARELLE_URL', 'http://xbrl-to-json-converter_arelle_service_1:8001')
        print(f"ARELLE_URL: {arelle_url}")
        with open(file_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(f'{arelle_url}/convert/', files=files)
            response.raise_for_status()
            json_data = response.json()

        # Save locally
        converted_dir = "converted_files"
        os.makedirs(converted_dir, exist_ok=True)
        json_file_path = os.path.join(converted_dir, f"{user_id}.json")
        with open(json_file_path, 'w', encoding='utf-8') as jf:
            json.dump(json_data, jf, ensure_ascii=False, indent=4)

        os.remove(file_path)  # remove original

        return JSONResponse(
            {
                "message": "XBRL File uploaded & converted successfully",
                "json_data": json_data
            },
            status_code=200
        )

    except Exception as e:
        traceback.print_exc()
        try:
            os.remove(file_path)
        except:
            pass
        return JSONResponse({"error": str(e)}, status_code=500)