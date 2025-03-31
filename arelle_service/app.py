import tempfile

from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import os
import shutil
import json
import logging

logger = logging.getLogger("uvicorn.error")
logger.setLevel(logging.DEBUG)

from arelle_fun import convert

app = FastAPI()

@app.post("/convert/")
async def convert_file(file: UploadFile = File(...)):
    logger.debug("Convert endpoint called")

    # Create a temporary directory that will be automatically cleaned up
    with tempfile.TemporaryDirectory() as temp_dir:
        try:
            logger.debug(f"Created temporary directory: {temp_dir}")

            # Create paths for temporary files within the temp directory
            upload_path = os.path.join(temp_dir, "input_file")  # Generic filename
            json_output_path = os.path.join(temp_dir, "output.json")

            logger.debug(f"upload_path = {upload_path}")
            logger.debug(f"json_output_path = {json_output_path}")

            # Save the uploaded file content to the temp directory
            logger.debug("Saving upload file")
            file_content = await file.read()
            with open(upload_path, 'wb') as buffer:
                buffer.write(file_content)
            logger.debug("File saved")

            # Construct the command arguments
            command = [
                '-f', upload_path,
                '--plugins', 'validate/EFM|saveLoadableOIM',
                f'--saveLoadableOIM={json_output_path}'
            ]

            logger.debug(f"Calling conversion with command: {command}")

            # Call the convert function
            convert(command)
            logger.debug("Conversion successful")

            # Check if the JSON file was created
            if not os.path.exists(json_output_path):
                raise Exception("JSON output file was not created after conversion")

            # Read the generated JSON file
            logger.debug("Reading generated JSON file")
            with open(json_output_path, 'r', encoding='utf-8') as json_file:
                json_content = json.load(json_file)

            logger.debug("Successfully read JSON content")

            # Return the JSON content as a response
            return JSONResponse(content=json_content)

        except Exception as e:
            logger.error(f"Error during conversion: {str(e)}")
            return JSONResponse(
                content={"error": f"XBRL conversion failed: {str(e)}"},
                status_code=500
            )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
