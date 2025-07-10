# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
# Use --no-cache-dir to reduce image size
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the 'ai' directory's code into the container at /app
COPY . .

# Default command to run when the container starts (can be overridden)
CMD ["python", "-c", "print('SecureNet AI Base Image. Please run a specific script like server.py or client.py')"] 