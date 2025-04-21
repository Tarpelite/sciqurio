FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Create media directory if not exists
RUN mkdir -p media/videos

# Expose port
EXPOSE 8000

# Start command
CMD ["sh", "-c", "python scripts/wait_for_mongodb.py && python scripts/db_init.py && uvicorn main:app --host 0.0.0.0 --port 8000"]
