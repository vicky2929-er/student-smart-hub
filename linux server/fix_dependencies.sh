#!/bin/bash

# Fix PyOpenSSL/OpenSSL compatibility issue on Ubuntu
echo "Fixing PyOpenSSL/OpenSSL compatibility issue..."

# Remove conflicting packages
pip3 uninstall -y pyOpenSSL cryptography pymongo

# Update system packages
sudo apt update
sudo apt install -y build-essential libssl-dev libffi-dev python3-dev

# Install compatible versions
pip3 install --upgrade pip
pip3 install cryptography==41.0.7
pip3 install pyOpenSSL==23.3.0
pip3 install pymongo==4.6.0

# Install remaining requirements
pip3 install -r requirements.txt

echo "Dependencies fixed! You can now run: python3 app.py"
