FROM node:16.13.2-bullseye-slim

# Create app directory
WORKDIR /src/

# Install app dependencies
COPY package*.json ./
RUN npm ci

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "npm", "start" ]