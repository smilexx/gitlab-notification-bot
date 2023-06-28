#!/bin/sh
npm run typeorm migration:run -- -d ./dist/typeorm.config.js;

node ./dist/main.js;