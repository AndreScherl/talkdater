# Readme

## Install and Set Up MongoDB
Please follow these instructions: [https://docs.mongodb.com/manual/installation/](https://docs.mongodb.com/manual/installation/)

After that set the initial user for the database: [https://docs.mongodb.com/tutorials/enable-authentication/](https://docs.mongodb.com/tutorials/enable-authentication/)

And finally create the talkdater database:
```
$ mongo
> use talkdater
```

## The Server Part
### Edit the Config File `config/defaut.json`
Duplicate the file `config/default-dist.json` and rename it to `default.json`. Change the settings within that file to meet your requirements.

### Install and Start the API
Go into the server directory `cd api`.
Install the server `npm install`.
Start the server `npm start`.

## The Client Part
...