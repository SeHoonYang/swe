# Chatch mind example
### What is this
The environment issuer draws on the canvas with the given question(on the top-right corner). Clients submit their guesses. If the guess is correct, next question will be started.
### How to start
```
node app.js
```
### How to create a new environment
Access to http://~/, and click 'Create a new room'.
This will create new room.
Clicking 'Start a new room' will create and register new environment to the server.
### How to join the environment
Access to http://~/join?env_id=PREVIOUSLY_ISSUED_ENV_ID
### However, lobby system implemented
Every 5000ms, created room are shown in the index page. You can join by clicking "Join this room" in the lobby. Paging is implemented. Default page size is 10, you can page page number as a parameter (http://~/?page=~)
### Reference
I used code from http://www.williammalone.com/articles/create-html5-canvas-javascript-drawing-app/ to implement canvas.
I borrowed english words from https://www.talkenglish.com/vocabulary/top-1500-nouns.aspx.
