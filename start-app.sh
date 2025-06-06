#!/bin/bash
cd /home/ubuntu/OBR/OwlBear-llm-chat
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm run dev:full
