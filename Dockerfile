FROM python:3.11-slim

WORKDIR /app

# Install git (Red requires it for downloading cogs) and other dependencies
RUN apt-get update && apt-get install -y git build-essential default-jre

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Make the start script executable
RUN chmod +x start.sh

# Expose the port for the keep_alive server
EXPOSE 8080

CMD ["./start.sh"]
