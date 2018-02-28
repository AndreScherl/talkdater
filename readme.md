# Readme
## Docker installation of Aqua user management system
The aqua Dockerfile just starts the mongodb server but inserts no admin user.
You can run the first-time-setup script of aqua to get this done.
So you have to build and run the docker container, execute the setup script, shutdown the running container and start them over again.    


I will automate these things soon, but for now you have to follow the steps below:
* (Terminal 1) Build and run the docker containers: `$ docker-compose up`    
* (Terminal 2) Go into the container: `$ docker exec -it <container name> /bin/bash`
  * Install bcrypt: `$ npm install bcrypt --save`
  * Do first setup: `$ npm run first-time-setup`
    * The mongo db uri is: `mongodb://db:27017/aqua`
    * Root user email: your choice
    * Root user password: your choice
  * Start the aqua server again: `npm start`
* (Terminal 1) Ctrl+C to shutdown the running docker container
* (Terminal 1) `docker-compose up`

That's it.