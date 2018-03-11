#!/bin/bash
PATH=$PATH:$(npm bin)
set -x
# Production build
ng build --prod
# merge ngsw-manifest and copy to dist
./node_modules/.bin/ngu-sw-manifest --module src/app/app.module.ts \ --out dist/ngsw-manifest.json
# Serve
cd dist
http-server