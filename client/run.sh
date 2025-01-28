#!/bin/sh

echo "globalThis.config = { \"BACKEND_WS_ORIGIN\": \"${BACKEND_WS_ORIGIN}\" };" > ./config.js

exec npm run dev -- --host
