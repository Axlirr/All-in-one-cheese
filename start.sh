#!/bin/bash

# Start the keep-alive server in the background
python keep_alive.py &

# Ensure an instance name is provided or default to 'renderbot'
INSTANCE_NAME=${RED_INSTANCE_NAME:-"renderbot"}

# Check if the instance already exists
if [ ! -d "/app/data/${INSTANCE_NAME}" ]; then
    echo "Setting up new Red-DiscordBot instance: ${INSTANCE_NAME}"
    # Run non-interactive setup
    # Use local backend, default prefix '!'
    redbot-setup --instance-name "${INSTANCE_NAME}" --data-path "/app/data/${INSTANCE_NAME}" --no-prompt --backend json
fi

# Start the bot
# Note: The token should be provided via the RED_TOKEN environment variable
redbot "${INSTANCE_NAME}" --no-prompt
