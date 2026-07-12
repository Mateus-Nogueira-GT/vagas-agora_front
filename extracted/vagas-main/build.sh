#!/bin/bash
# Build script para EasyPanel sem nixpacks.toml
npm ci --legacy-peer-deps
npm run build
