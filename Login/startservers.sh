#!/bin/bash

# Navigate to the Login directory
cd Login

# Run both Node.js scripts concurrently
node server.js &
node usernameServer.js &

# Wait for both processes to complete
wait
