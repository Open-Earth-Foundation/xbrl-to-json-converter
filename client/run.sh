#!/bin/sh

cat << END > ./config.js
globalThis.config = {
  "VITE_API_URL": "${VITE_API_URL}",
  "BACKEND_WS_ORIGIN": "${BACKEND_WS_ORIGIN}"
};
END

exec npm run dev -- --host
