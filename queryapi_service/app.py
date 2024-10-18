from fastapi import FastAPI, HTTPException
import json
from typing import Optional, List, Dict
import os
app = FastAPI()
ESRS_DIRECTORY = 'esrs_data'
# Load the JSON data once at startup for better performance
def open_json():
    with open('esrs_json.json') as file:
        esrs_json = json.load(file)
    return esrs_json

data = open_json()

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

def find_concept_group(tag):
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

# FastAPI endpoint to search for a concept
@app.get("/concept/")
async def get_concept(tag: str):
    concept, group = find_concept_group(tag)
    if concept:
        return {"concept": concept}
    raise HTTPException(status_code=404, detail="Concept not found")

# FastAPI endpoint to search for a concept group
@app.get("/concept-group/")
async def get_concept_group_endpoint(tag: str):
    concept, group = find_concept_group(tag)
    if group:
        return {"concept_group": group}
    raise HTTPException(status_code=404, detail="Concept group not found")

# Optional endpoint to search for both concept and concept group
@app.get("/concept-and-group/")
async def get_concept_and_group(tag: str):
    concept, group = find_concept_group(tag)
    if concept and group:
        return {"concept": concept, "concept_group": group}
    raise HTTPException(status_code=404, detail="Concept or Concept group not found")

# New endpoint to process references mentioning ESRS
@app.get("/reference/")
async def reference_endpoint(reference: str):
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
            raise HTTPException(status_code=400, detail="Unable to parse the reference")
    else:
        # If the reference does not mention ESRS, do not process it
        return {"message": "Reference does not mention ESRS; processing skipped."}

def parse_reference(reference: str) -> List[Dict[str, str]]:
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


def get_esrs_text(parsed_ref: Dict[str, str]) -> Optional[Dict[str, str]]:
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

def map_document_to_filename(document: str) -> Optional[str]:
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