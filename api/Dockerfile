FROM node:carbon

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
# COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

# Run thhe nodemon command in docker-compose.yml to get changes working immediately.
RUN npm install -g nodemon

# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]