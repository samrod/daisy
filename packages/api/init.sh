#!/bin/bash
ulimit -n

b="\033[1m"
none="\033[0m"
red="\033[0;31m"
blue="\033[0;34m"
green="\033[1;32m"
yellow="\033[1;33m"

status() {
  printf "\n${blue}${b}REMOTE${none}: ${yellow}$1${none}"
}

if [ ! -d "$HOME/.asdf" ]; then
  status "Installing asdf...\n"
  git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.13.1
fi
. ~/.asdf/asdf.sh

cd /var/www/beta.daisyemdr.com/api
. .env*

status "Installing asdf plugins...\n"
asdf plugin-add nodejs || true
asdf plugin-add yarn || true

status "Installing Node.js and Yarn...\n"
asdf install

# corepack enable
yarn set version 4.5.0
# corepack] prepare yarn@4.5.0 --activate

status "Yarn version: ${green}$(yarn -v)"
status "Node version: ${green}$(node -v)"
status "Space available: ${green}$(df -h / | awk 'NR==2 {print $4}')\n"

status "Installing dependencies...\n"
yarn cache clean && yarn install

status "Starting/Restarting Node server...\n"
rm -rf ~/.pm2/logs/daisy-api-*
pm2 startOrRestart daisy-api.json &
pm2 status
