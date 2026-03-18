#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Installing server dependencies..."
cd "$SCRIPT_DIR/server" && npm install

echo "Installing client dependencies..."
cd "$SCRIPT_DIR/client" && npm install

echo "Building client..."
cd "$SCRIPT_DIR/client" && npm run build

echo "Building server..."
cd "$SCRIPT_DIR/server" && npm run build

echo "Starting server..."
cd "$SCRIPT_DIR/server" && npm start
