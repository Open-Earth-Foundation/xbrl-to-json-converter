from pathlib import Path
import json
from find_concept_group import find_concept_group

# Get the path to the esrs_data directory relative to this file
ESRS_DATA_DIR = Path(__file__).parent.parent / 'esrs_data'
ESRS_JSON_PATH = ESRS_DATA_DIR / 'esrs_json.json'

def open_json():
    try:
        with ESRS_JSON_PATH.open('r', encoding='utf-8') as file:
            esrs_json = json.load(file)
        return esrs_json
    except FileNotFoundError:
        print(f"Error: Could not find file at {ESRS_JSON_PATH}")
        return None
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in file {ESRS_JSON_PATH}")
        return None

def get_concept_and_group(tag):
    """
    Retrieve the concept and its corresponding group based on the provided tag.
    Args:
        tag (str): The tag to search for in the data.
    Returns:
        dict: A dictionary containing the concept and its group. 
              If the concept and group are found, the dictionary will have the keys:
              - "concept": The found concept.
              - "concept_group": The group associated with the found concept.
              If not found, both keys will have the value None.
    """
    
    data = open_json()

    concept, group = find_concept_group(data, tag)
    if concept and group:
        return {"concept": concept, "concept_group": group}
    else:
        return {"concept": None, "concept_group": None}