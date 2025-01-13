import json
from find_concept import find_concept_group
import os

ESRS_DIRECTORY = os.path.join(os.path.dirname(__file__), '..', 'esrs_data')

def open_json():
    with open('esrs_json.json') as file:
        esrs_json = json.load(file)
    return esrs_json


def get_concept(tag: str):
    data = open_json()
    concept, group = find_concept_group(data, tag)
    if concept:
        return {"concept": concept}
    else:
        return {"concept": None}

