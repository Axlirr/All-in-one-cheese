#!/bin/bash

# Start the keep-alive server in the background
python keep_alive.py &

# Ensure an instance name is provided or default to 'renderbot'
export RED_INSTANCE_NAME=${RED_INSTANCE_NAME:-"renderbot"}

# Run the smart setup script which handles the Postgres URI parsing
python setup_red.py

# Start the bot
redbot "${RED_INSTANCE_NAME}" --token "${RED_TOKEN}" --prefix "${RED_PREFIX:-!}" --no-prompt
