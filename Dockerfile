###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:22.17.0-alpine AS development

# Create app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY . .

# RUN corepack enable

# Use the node user from the image (instead of the root user)
# USER node

# Install app dependencies using the `npm ci` command instead of `npm install`
RUN yarn install

###################
# BUILD FOR PRODUCTION
###################

FROM development AS build

WORKDIR /usr/src/app

# RUN corepack enable

# Set NODE_ENV environment variable
ENV NODE_ENV=production

# Run the build command which creates the production bundle
RUN yarn build

###################
# PRODUCTION
###################

FROM node:22.17.0-alpine AS production

RUN apk add --no-cache curl

ENV NODE_ENV=production

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/views ./views
COPY --chown=node:node --from=build /usr/src/app/package.json ./package.json
COPY --chown=node:node --from=build /usr/src/app/start.sh ./start.sh

RUN chmod +x ./start.sh

# Start the server using the production build
CMD ["./start.sh"]