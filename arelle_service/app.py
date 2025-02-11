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
