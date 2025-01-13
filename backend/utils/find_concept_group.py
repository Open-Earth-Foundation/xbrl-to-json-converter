

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

def find_concept_group(data, tag):
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