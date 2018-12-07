# Chatch mind example
### What is this
The environment issuer draws on the canvas with the given question(on the top-right corner). Clients submit their guesses. If the guess is correct, next question will be started.
### How to start
```
node app.js
```
### How to create a new environment
Access to http://~/, and click 'Start a new room'.
This will shows issued environment id
### How to join the environment
Access to http://~/join?env_id=PREVIOUSLY_ISSUED_ENV_ID
### Lobby system implemented
Every 5000ms, created room are shown in the index page.
### Reference
I used code from http://www.williammalone.com/articles/create-html5-canvas-javascript-drawing-app/ to implement canvas.
I borrowed english words from https://www.talkenglish.com/vocabulary/top-1500-nouns.aspx.
