#!/bin/bash
pnpm run build
cd dist
zip -r ../frontend_dist.zip ./* -x "*.DS_Store"
cd ..