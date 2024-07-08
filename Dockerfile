# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory
WORKDIR /usr/src/Analytics_API

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install build-essential for native module compilation
RUN apt-get update && apt-get install -y build-essential

RUN npm install -g --unsafe-perm

# Bundle app source
COPY . .


# Install app dependencies
# RUN rm -rf node_modules package-lock.json
RUN npm install -g --unsafe-perm
RUN npm install yarn

RUN rm -rf node_modules

RUN npm install -g nodemon
RUN npm install -g node-gyp node-pre-gyp express
# RUN cd ./node_modules/bcrypt && npm rebuild bcrypt --build-from-source --unsafe-perms

RUN npm install
RUN yarn install

# Expose the port your app runs on
EXPOSE 9000

# Define the command to run your app
CMD [ "npm", "start" ]