###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:18 As development

# Create app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY --chown=node:node package.json pnpm-lock.yaml ./

RUN corepack enable

# Use the node user from the image (instead of the root user)
# USER node

# Install app dependencies using the `npm ci` command instead of `npm install`
RUN pnpm install

###################
# BUILD FOR PRODUCTION
###################

FROM node:18 As build

WORKDIR /usr/src/app

COPY package.json ./

# In order to run `npm run build` we need access to the Nest CLI which is a dev dependency. In the previous development stage we ran `npm ci` which installed all dependencies, so we can copy over the node_modules directory from the development image
COPY --from=development /usr/src/app/node_modules ./node_modules

COPY . .

RUN corepack enable

# Set NODE_ENV environment variable
ENV NODE_ENV production

# Run the build command which creates the production bundle
RUN pnpm build

###################
# PRODUCTION
###################

FROM node:18-alpine As production

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/views ./views
COPY --chown=node:node --from=build /usr/src/app/package.json ./package.json

# Start the server using the production build
CMD [ "node", "dist/main.js" ]