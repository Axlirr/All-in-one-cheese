#!/bin/bash

# Start the keep-alive server in the background
python keep_alive.py &

# Run the smart setup script which handles the Postgres URI parsing
python setup_red.py

# Start the bot
# Note: The token should be provided via the RED_TOKEN environment variable
redbot "${INSTANCE_NAME}" --no-prompt
