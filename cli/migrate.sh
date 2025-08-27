#!/bin/sh

set -e

# Get repository root
repository_root=${REPOSITORY_ROOT:-$(dirname "$0")/..}

# Compile TypeScript backend
echo "Compiling backend TypeScript..."
(cd "$repository_root/backend" && npm run build)

# Run the migration script
echo "Running migration..."
node "$repository_root/backend/dist/utils/migrate.js"

echo "Migration completed!"