#!/bin/bash

# Start the keep-alive server in the background
python keep_alive.py &

# Ensure an instance name is provided or default to 'renderbot'
export RED_INSTANCE_NAME=${RED_INSTANCE_NAME:-"renderbot"}

# Run the smart setup script which handles the Postgres URI parsing
python setup_red.py

# Use RED_TOKEN, but fallback to DISCORD_TOKEN if it exists
export ACTUAL_TOKEN=${RED_TOKEN:-$DISCORD_TOKEN}

# Start the bot
redbot "${RED_INSTANCE_NAME}" --token "${ACTUAL_TOKEN}" --prefix "${RED_PREFIX:-!}" --no-prompt
