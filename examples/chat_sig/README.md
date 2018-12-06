# Chatting example
### How to start
```
node app.js
```
### How to create a new environment
Access to http://~/, and click 'Start a new room'.
This will shows issued environment id
### How to join the environment
Access to http://~/join?env_id=PREVIOUSLY_ISSUED_ENV_ID

# Limitation
This example uses signal variable. So when a new client joined to the environment, previous messages will not be shown to the new client. However, performance problem of normal chat example is solved.
