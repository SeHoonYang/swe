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
This example retrieve entire chatting messages from the server on every sync request. So if messages are stacked, performance will drop.
