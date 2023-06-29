#!/bin/sh
npm run typeorm migration:run -- -d ./dist/src/typeorm.config.js;

node ./dist/src/main.js;