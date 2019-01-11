# Readme

## Configuration first
Duplicate the file `config/default-dist.json` and rename it to `default.json`. Change the settings within that file to meet your requirements.

## Use Docker
`docker-compose up` should do the trick.

## The Server Part without Docker
### Install and Set Up MongoDB
Please follow these instructions: [https://docs.mongodb.com/manual/installation/](https://docs.mongodb.com/manual/installation/)    
After that set the initial user for the database: [https://docs.mongodb.com/tutorials/enable-authentication/](https://docs.mongodb.com/tutorials/enable-authentication/)    
And finally create the talkdater database:
```
$ mongo
> use talkdater
```

### Install and Start the API
Go into the server directory `cd api`.
Install the server `npm install`.
Start the server `npm start`.

## The Client Part
...

## Make API Calls against
|URI                            |Params                             |Description        |
|-------                        |-------                            |-------            |
|/api/auth/local/login          |`{ username, password }`           |Login              |
|/api/auth/user/user            |                                   |Get user state     |
|/api/auth/session/logout       |                                   |Logout             |
|/api/auth/local/set-username   |`{ username }`                     |                   |
|/api/auth/local/set-email      |`{ email }`                        |                   |
|/api/auth/local/register       |`{ email, password }`              |Register           |
|/api/auth/local/verify         |`{ userId, token }`                |Verify user email  |
|/api/auth/local/forgot-password|`{ username }`                     |Forgot password    |
|/api/auth/local/reset-password |`{ userId, token, newPassword }`   |Reset password     |
|/api/auth/local/change-password|`{ password, newPassword }`        |Change password    |

