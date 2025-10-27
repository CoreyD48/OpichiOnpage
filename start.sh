#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$SCRIPT_DIR/server" && npm run dev &
SERVER_PID=$!

cd "$SCRIPT_DIR/client" && npm run dev &
CLIENT_PID=$!

wait $SERVER_PID $CLIENT_PID
