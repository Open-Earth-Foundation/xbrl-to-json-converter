import json
from find_concept import find_concept_group
ESRS_DIRECTORY = 'esrs_data'

def open_json():
    with open('esrs_json.json') as file:
        esrs_json = json.load(file)
    return esrs_json

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