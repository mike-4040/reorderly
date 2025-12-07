#!/bin/bash

# Start Firebase Emulators for local development

# Cleanup function to kill both processes
cleanup() {
  echo -e "\n\nShutting down..."
  kill $tsc_pid 2>/dev/null
  kill $emulators_pid 2>/dev/null
  exit
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

# Start TypeScript compiler in watch mode
npx tsc -w --preserveWatchOutput &

tsc_pid=$!

# Load environment variables using Doppler
doppler secrets download --project backend --config dev --format env --no-file > .env
if [ $? -ne 0 ]; then
  echo "downloadSecrets_failed" 1>&2
  exit 1
fi

# Start Firebase emulators with environment variables in .env
firebase emulators:start \
  --only functions,firestore,auth,pubsub \
  --import=./emulators-data \
  --export-on-exit&

emulators_pid=$!

# Wait for both processes
wait
