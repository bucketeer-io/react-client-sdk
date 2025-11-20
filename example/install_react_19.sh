#!/bin/bash

echo "🔄 Updating React to version ^19.2.0 ..."

# Update example package.json
echo "📦 Updating example package.json, install React 19"
pnpm add react@^19.2.0 react-dom@^19.2.0
pnpm add -D @types/react@^19.2.0 @types/react-dom@^19.2.0

echo "✅ React updated to version ^19.2.0 !"
