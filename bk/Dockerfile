FROM python:3.10-slim

WORKDIR /app

# Install cron and required packages
RUN apt-get update && apt-get install -y cron

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Create necessary directories and set permissions
RUN mkdir -p data && \
    chmod 777 data

# Make scripts executable

# Create a startup script that preserves environment variables
RUN echo '#!/bin/bash\n\
# Setup environment variables for cron\n\
# printenv | grep -v "no_proxy" > /app/.env.cron\n\
# Verify environment variables\n\
if [ -z "$THE_ODDS_API_KEY" ]; then\n\
    echo "Error: THE_ODDS_API_KEY is not set"\n\
    exit 1\n\
fi\n\
# Start cron service\n\
# service cron start\n\
# Setup cron job with error handling\n\
# python scripts/setup_cron.py || echo "Warning: Cron setup failed, continuing..."\n\
# Start the application\n\
python run.py' > /app/start.sh && chmod +x /app/start.sh

# Expose the port the app runs on
EXPOSE 5001

# Command to run the application
CMD ["/app/start.sh"] 