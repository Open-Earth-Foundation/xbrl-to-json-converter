#!/usr/bin/env python
"""
This script will recursively scan a directory, skip files ignored by .gitignore
in the same way GitHub does (using 'pathspec' for gitwildmatch), and produce
a single markdown file listing the contents of all non-ignored files.

Additionally:
- It explicitly skips specific folders:
  - .git (Git internals)
  - .next (built Next.js files)
  - k8s (Kubernetes configs)
  - queryapi_service
  - .github
- It explicitly skips package-lock.json
- It explicitly skips md_producer.py itself
- If a file cannot be decoded (e.g., it's binary), it will be skipped.

The output format for each file is:

### filename relative_path
[file contents go here]
### END filename
"""

import os
import sys
from pathlib import Path

try:
    import pathspec
except ImportError:
    print("Please install pathspec via: pip install pathspec")
    sys.exit(1)

# ------------------------
# Configuration Variables
# ------------------------
ROOT_DIRECTORY = r"./"  # Change this to the directory you want to scan

# Directories to skip explicitly
SKIP_DIRECTORIES = {
    ".git",
    ".next",
    "k8s",
    "queryapi_service",
    ".github"
}

# ------------------------
# Output File
# ------------------------
OUTPUT_FILE = "overview.md"


def load_gitignore_patterns(root_dir):
    """
    Loads .gitignore from the given directory (if present) and returns a pathspec object.
    """
    gitignore_path = os.path.join(root_dir, ".gitignore")
    if not os.path.isfile(gitignore_path):
        # If no .gitignore is present, return an empty pathspec
        return pathspec.PathSpec.from_lines("gitwildmatch", [])

    with open(gitignore_path, "r", encoding="utf-8") as f:
        gitignore_lines = f.readlines()

    # Create a PathSpec object from the lines of the .gitignore
    spec = pathspec.PathSpec.from_lines("gitwildmatch", gitignore_lines)
    return spec


def is_ignored(file_path, root_dir, spec):
    """
    Given an absolute file path, return True if it should be ignored
    according to the .gitignore pathspec. Otherwise, return False.
    """
    relative_path = os.path.relpath(file_path, root_dir)
    return spec.match_file(relative_path)


def main():
    # Normalize the root directory path
    root_dir = os.path.abspath(ROOT_DIRECTORY)

    # Load .gitignore patterns
    spec = load_gitignore_patterns(root_dir)

    # Prepare an output markdown file
    with open(OUTPUT_FILE, "w", encoding="utf-8") as output_md:
        # Walk the directory structure
        for current_path, dirs, files in os.walk(root_dir):
            # -----------------------------------------------------------------
            #  Skip directories explicitly:
            # -----------------------------------------------------------------
            # Use a copy of the list since we're modifying it
            dirs[:] = [d for d in dirs if d not in SKIP_DIRECTORIES]

            # Loop through files in the current directory
            for file_name in files:
                # Skip files explicitly:
                #   1) The package-lock.json file
                #   2) The md_producer.py script (to avoid including itself)
                if file_name in ["package-lock.json", "md_producer.py"]:
                    continue

                abs_file_path = os.path.join(current_path, file_name)

                # Skip anything matched by .gitignore (pathspec)
                if is_ignored(abs_file_path, root_dir, spec):
                    continue

                # Attempt to read file content as text
                try:
                    with open(abs_file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                except (UnicodeDecodeError, PermissionError):
                    # If we can't read/parse the file (binary or restricted), skip it
                    continue

                # Build relative path (for output/display)
                rel_path = os.path.relpath(abs_file_path, root_dir)

                # Write the file marker, file content, and closing marker
                output_md.write(f"### {file_name} {rel_path}\n")
                output_md.write(content)
                output_md.write(f"\n### END {file_name}\n\n")

    print(f"Overview created in '{OUTPUT_FILE}'")


if __name__ == "__main__":
    main()
