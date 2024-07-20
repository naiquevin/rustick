#!/usr/bin/env bash

set -e

if ! command -v gh-pages &> /dev/null
then
    echo "gh-pages command not found. Run 'npm -g install gh-pages' to install it"
    exit 1
fi

mkdir -p dist

wasm-pack build --release --target web

cp -R pkg dist/
cp {metronome.js,index.html,main.js,style.css} dist/

# Workaround for a known issue:
# https://github.com/tschaub/gh-pages/issues/354#issuecomment-879929437
export CACHE_DIR=/tmp/rustick-ghp-cache

gh-pages --dist dist
