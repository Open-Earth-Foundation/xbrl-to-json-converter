import json
import os
import re  # for the simplify_tag_number regex

# ----------------------------------------------------------------------------------------
# Helper functions to handle references from ESRS or other relevant documents
# (as provided in the reference snippet).
# ----------------------------------------------------------------------------------------

ESRS_DIRECTORY = os.path.join(os.path.dirname(__file__), '..', 'esrs_data')

def simplify_tag_number(tag_number):
    """
    Extract only the first integer in the tag_number.
    For example:
        "11 c SBM-3" -> "11"
        "10 b SBM-3" -> "10"
    If no integer is found, returns the original tag_number unchanged.
    """
    m = re.search(r'^(\d+)', tag_number.strip())
    if m:
        return m.group(1)
    return tag_number  # fallback: no digits found at start

def reference_endpoint(reference):
    """
    Endpoint to process the 'references' field only if it mentions ESRS and use the ESRS documents.
    Adds a 'reference' key in the result so you can see the exact references being processed.
    """
    if 'ESRS' in reference:
        parsed_references = parse_reference(reference)
        if parsed_references:
            results = []
            for parsed_ref in parsed_references:
                result = get_esrs_text(parsed_ref)
                # Build a combined reference string: "ESRS S2 11 c SBM-3" for example
                full_ref_str = f"{parsed_ref.get('document')} {parsed_ref.get('tag_number')}".strip()
                
                if result:
                    # Add 'reference' to the found result
                    result["reference"] = full_ref_str
                    results.append(result)
                else:
                    # Insert 'reference' so you know which ref was not found
                    results.append({
                        "message": f"Tag not found in {parsed_ref.get('document')} (or no text for '{parsed_ref.get('tag_number')}')",
                        "reference": full_ref_str
                    })
            return {"results": results}
        else:
            return {"results": None}
    else:
        # If the reference does not mention ESRS, do not process it
        return {"results": None}

def parse_reference(reference):
    """
    Parses the reference string into structured components, processing only references that mention ESRS.
    Example of reference string: " ESRS ESRS 2 3 BP-1, ESRS E1 41 "
    """
    references = [ref.strip() for ref in reference.strip().split(',') if ref.strip()]
    parsed_list = []
    for ref in references:
        if 'ESRS' in ref:
            parts = ref.strip().split()
            parsed = {}
            # Minimal check: must start with "ESRS"
            if parts[0] == 'ESRS':
                # We might have "ESRS ESRS 2 41" or "ESRS E1 41"
                if len(parts) >= 3:
                    if parts[1] == 'ESRS':
                        # e.g. "ESRS ESRS 2 3 BP-1"
                        document = f"{parts[1]} {parts[2]}"  # "ESRS 2"
                        tag_number = ' '.join(parts[3:])
                    else:
                        # e.g. "ESRS E1 41"
                        document = f"{parts[0]} {parts[1]}"  # "ESRS E1"
                        tag_number = ' '.join(parts[2:])
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
            # references not mentioning ESRS are ignored
            continue
    return parsed_list

def get_esrs_text(parsed_ref):
    """
    Retrieves the text corresponding to the 'tag_number' in the ESRS 'document'.
    Looks up JSON files in the ESRS_DIRECTORY (mapped by map_document_to_filename).
    """

    document = parsed_ref.get('document')
    original_tag_number = parsed_ref.get('tag_number')

    if not document or not original_tag_number:
        return None

    # If you want to strip off trailing text:
    # "ESRS S2 11 c SBM-3" -> "ESRS S2 11"
    # you can simplify the tag_number here:
    simplified_num = simplify_tag_number(original_tag_number)
    # Now reconstruct the full tag to search in your JSON data
    # Example: "ESRS S2" + " " + "11" -> "ESRS S2 11"
    full_tag = f"{document} {simplified_num}".strip()

    filename = map_document_to_filename(document)
    if not filename:
        return {"message": f"Document {document} not found in file mapping."}

    file_path = os.path.join(ESRS_DIRECTORY, filename)
    if not os.path.exists(file_path):
        return {"message": f"File for {document} not found: {filename}"}

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            esrs_data = json.load(f)
    except Exception as e:
        return {"message": f"Error reading {filename}: {str(e)}"}

    # Now we search for "ESRS S2 11" (for example) in esrs_data
    for item in esrs_data:
        if item.get('tag') == full_tag:
            return {
                "document": document,
                "tag": full_tag,
                "text": item.get('text')
            }

    # If no match is found, return None
    return None

def map_document_to_filename(document):
    """
    Maps the ESRS document identifier to the corresponding JSON file name.
    Adjust as needed if more mappings are introduced.
    """
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
    }
    return document_mapping.get(document)

# ----------------------------------------------------------------------------------------
# The find_concept and find_concept_group functions, as provided in the snippet.
# ----------------------------------------------------------------------------------------

def find_concept(data, tag):
    """
    Recursively find the concept list containing the specified tag in the data (presentation).
    data is typically a nested combination of lists/dicts representing the taxonomy structure.
    """
    if isinstance(data, list):
        # Check if the list is a "concept" definition
        if len(data) >= 2 and data[0] == "concept":
            concept_data = data[1]
            if isinstance(concept_data, dict) and concept_data.get("name") == tag:
                return data
        # Otherwise keep drilling down
        for item in data:
            result = find_concept(item, tag)
            if result:
                return result
    elif isinstance(data, dict):
        # If dictionary, we check all values recursively
        for value in data.values():
            result = find_concept(value, tag)
            if result:
                return result
    return None

def find_concept_group(data, tag):
    """
    Finds a concept and its concept group within the 'presentation' array, by searching for a concept named `tag`.
    Returns (concept_found, group_found).
    - concept_found: the list starting with "concept" if found
    - group_found: the item in the "presentation" list where the concept was found
    """
    data_list = data.get('presentation', [])
    if isinstance(data_list, list):
        for item in data_list:
            # Try to find the concept within this item
            result = find_concept(item, tag)
            if result:
                # 'item' is the "group" that encloses that concept
                return (result, item)
    return (None, None)

# ----------------------------------------------------------------------------------------
# Main function that:
# 1) Iterates the ESRS facts (like in the user's "filled ESRS RAPORT")
# 2) Extracts the concept name
# 3) Finds the concept in the "presentation" data (like the ESRS taxonomy snapshot)
# 4) Extracts references for that concept
# 5) Saves them in a new key "esrs_data_reference" in the fact dictionary
# ----------------------------------------------------------------------------------------

def enhance_report_with_esrs_references(report_data, esrs_reference_snapshot):
    """
    Goes through each fact in report_data["facts"], finds the concept in the esrs_reference_snapshot,
    retrieves the references, and creates a new key "esrs_data_reference" in that fact.
    """
    # Loop through each fact in the report
    for fact_id, fact_content in report_data.get("facts", {}).items():
        # 1) Extract the concept name from the 'dimensions'
        dimensions = fact_content.get("dimensions", {})
        concept_name = dimensions.get("concept")
        if not concept_name:
            continue

        # 2) Find the concept and concept group from the snapshot
        found_concept, found_group = find_concept_group(esrs_reference_snapshot, concept_name)

        # 3) If we found the concept, let's try to extract references from the concept definition
        references_data = None
        if found_concept and len(found_concept) >= 3:
            concept_details = found_concept[2]
            if isinstance(concept_details, dict):
                references_data = concept_details.get("references")

        # 4) Use reference_endpoint to parse and get actual references from ESRS if any
        if references_data:
            reference_info = reference_endpoint(references_data)
        else:
            reference_info = {"results": None}

        # 5) Construct an object to store as "esrs_data_reference"
        esrs_data_reference = {
            "concept": concept_name,
            "concept_group": None,
            "parsed_references": reference_info["results"]
        }

        # If we want to store info about the group
        if isinstance(found_group, list) and len(found_group) >= 2:
            group_role_def = found_group[1]
            if isinstance(group_role_def, dict):
                concept_group_role = group_role_def.get("role")
                concept_group_definition = group_role_def.get("definition")
                if concept_group_role or concept_group_definition:
                    esrs_data_reference["concept_group"] = {
                        "role": concept_group_role,
                        "definition": concept_group_definition
                    }

        # 6) Attach esrs_data_reference to the fact
        fact_content["esrs_data_reference"] = esrs_data_reference

    return report_data


# ----------------------------------------------------------------------------------------
# Example usage / main entry point
# ----------------------------------------------------------------------------------------

if __name__ == "__main__":
    try:
        # 1) Load an example filled report (replace with your file path)
        with open(os.path.join(ESRS_DIRECTORY, 'example_filled.json'), 'r', encoding='utf-8') as f:
            report_data = json.load(f)
            
        # 2) Load the ESRS reference snapshot (replace with your file path)
        with open(os.path.join(ESRS_DIRECTORY, 'esrs_json.json'), 'r', encoding='utf-8') as f:
            esrs_reference_snapshot = json.load(f)
            
        # 3) Call the enhance function
        enhanced_report = enhance_report_with_esrs_references(report_data, esrs_reference_snapshot)
        
        # 4) Save the enhanced report
        output_path = os.path.join(ESRS_DIRECTORY, 'enhanced_report.json')
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(enhanced_report, f, indent=4, ensure_ascii=False)
            
        print(f"Enhanced report saved to {output_path}")
            
    except FileNotFoundError as e:
        print(f"Error: Required file not found - {e}")
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON format - {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")
