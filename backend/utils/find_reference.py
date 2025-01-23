import os 
import json
ESRS_DIRECTORY = os.path.join(os.path.dirname(__file__), '..', 'esrs_data')

def reference_endpoint(reference):
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
            return {"results": None}
    else:
        # If the reference does not mention ESRS, do not process it
        return {"results": None}
    



def parse_reference(reference):
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


def get_esrs_text(parsed_ref):
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

def map_document_to_filename(document):
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