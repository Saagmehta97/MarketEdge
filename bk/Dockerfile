FROM python:3.10-slim

WORKDIR /app

# Install cron
RUN apt-get update && apt-get install -y cron

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Create necessary directories and set permissions
RUN mkdir -p data && \
    chmod 777 data

# Make the setup script executable
RUN chmod +x scripts/setup_cron.py

# Create a startup script
RUN echo '#!/bin/bash\n\
python scripts/setup_cron.py\n\
service cron start\n\
python run.py' > /app/start.sh && chmod +x /app/start.sh

# Expose the port the app runs on
EXPOSE 5001

# Command to run the application
CMD ["/app/start.sh"] 