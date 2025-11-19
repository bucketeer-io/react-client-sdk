#!/bin/bash

echo "🔄 Updating React to version ^18.2.0 ..."

# Update example package.json
echo "📦 Updating example package.json, install React 18"
pnpm add react@^18.2.0 react-dom@^18.2.0
pnpm add -D @types/react@^18.2.0 @types/react-dom@^18.2.0

echo "✅ React updated to version ^18.2.0!"
