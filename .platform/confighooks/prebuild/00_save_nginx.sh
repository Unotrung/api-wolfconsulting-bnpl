#!/bin/bash

set -euo pipefail

CONFIG_PATH='/etc/nginx/nginx.conf'

# Simple method of keeping configurations between updates. Use in conjuction with postdeploy hook.
# Save nginx configuration to root's home folder

if [ -f "$CONFIG_PATH" ]; then
    cp "$CONFIG_PATH" "$HOME"
fi
