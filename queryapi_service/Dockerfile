# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any necessary dependencies
RUN pip install --no-cache-dir fastapi uvicorn

# Expose the port that FastAPI will run on
EXPOSE 8000

# Command to run the FastAPI server
CMD ["uvicorn", "esrs_fastapi_server:app", "--host", "0.0.0.0", "--port", "8000"]