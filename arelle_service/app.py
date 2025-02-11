from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import os
import shutil
import json

# Assuming your convert function and required imports are in a module named convert_module
from arelle_fun import convert

app = FastAPI()

@app.post("/convert/")
async def convert_file(file: UploadFile = File(...)):
    # Define the paths for the uploaded file and the output JSON in the main directory
    main_dir = os.path.dirname(os.path.abspath(__file__))
    upload_path = os.path.join(main_dir, file.filename).replace("\\", "/")
    json_output_path = os.path.join(main_dir, 'file.json').replace("\\", "/")

    # Save the uploaded file
    with open(upload_path, 'wb') as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Construct the command arguments
    command = [
        '-f', upload_path,
        '--plugins', 'validate/EFM|saveLoadableOIM',
        f'--saveLoadableOIM={json_output_path}'
    ]

    # Call the convert function
    try:
        convert(command)
    except Exception as e:
        print("An error occurred during conversion:", e)
        os.remove(upload_path)
        os.remove(json_output_path)
        return JSONResponse(content={"error": "An error occurred during conversion"})

    # Read the generated JSON file
    with open(json_output_path, 'r') as json_file:
        json_content = json_file.read()

    # Optionally, clean up the uploaded file and the JSON output if you don't want to keep them
    os.remove(upload_path)
    os.remove(json_output_path)

    # Return the JSON content as a response
    return JSONResponse(content=json.loads(json_content))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
