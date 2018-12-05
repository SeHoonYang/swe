# SWE
synchronized web environment (javascript network library using ajax call)

# About
The purpose of this library is implementing simple network tool with node. With this library, you can make web based application (that requires synchronization between clients and server) easily. This library is inappropriate for business product for now since I did not consider security stuff while writing the code.

# Compatibility
This library is tested with node.js 10.9.0 but maybe you can try this with higher versions. For client side, browser needs to support XMLHttpRequest function.

# Manual
### Server side
For the server side, you have to write 3 files : app.js, env.json, logic.js
* app.js is a nodejs index file. Define your routers, set constants and start the server.
* env.json defines synchronized environment structure.
* logic.js have to implements 4 methods.
### 1. define environment
env.json file has the following structure
```
{
	"sync_var" : [
		{"name" : "sync_var1", "value" : value_1, "sync_rate" : 10},
		{"name" : "sync_var2", "value" : value_2,  "sync_rate" : 1}
	],
	"server_var" : [
		{"name" : "var_3", "value" : value_3}
	],
	"timeout" : 10
}
```
Variables that belong to sync_var will be sent to clients periodically. "name" field indicates the name of the variable. "value" field indicates initial value of the variable. "sync_rate" field indicates period for synchronization. Clients will send synchronization request to the server periodically. Each request will increase the client's internal sync-counter by 1. If sync-counter % sync_rate == 0, the server will send the variable to the client.

Variables that belong to server_var will not be sent to clients. You can store variables that need to be hidden to clients.

timeout field indicates timeout time in seconds. If clients do not send sync request for specified time, the server regards the client as disconnected. The client will be excluded from the environment.
### 2. define environment logic
logic.js file has to be placed in the same directory as the env.json file.
logic.js file has to implment(and export) 4 methods.
a) start_env(env, client_id) : called when a new environment has established.
b) join_member(env, client_id) : called when a new member has joined.
c) message_arrived(env, client_id, action_id, arguments) : called when a message from the client has arrived.
d) timeout(env, client_id) : called when timeout detection logic found a disconnected client.

So the basic template of logic.js file is smilliar as following:
```
exports.start_env = function(env, client_id) {
};

exports.join_member = function(env, client_id) {
};

exports.message_arrived = function(env, client_id, action_id, arguments) {
};

exports.timeout = function(env, client_id) {
};
```
You can access sync variables and server variables by env.sync_vars / env.server_vars. Note that they are Map() in javascript. So you can access your variables defined at env.json by env.sync_vars.get("sync_var1").value or env.server_vars.set("var_3") and so on. Since server variables do not have sync rate field, value of the variables is obtained by env.server_vars.get(). However, env.sync_var.get() will return an object - {value: your_desired_value, sync_rate:some_sync_rate}.
### 3. define app.js
This file is your main script file for node. First, include the server.js from this library.
```
const server = require('server/server');
```
Then call initialize function. The function will return express instance.
```
// secret : secret for jwt. Assign arbitrary long string to this parameter.
// ep_prefix : prefix for api endpoint, starts with slash(/). ex) /api
// config_path : ABSOLUTE path for the directory that includes env.json / logic.js file.
// timeout : Period for timeout checker. In seconds.
const app = server.init_server(secret, ep_prefix, config_path, timeout);
```
You can add router by
```
app.get("~", (req, res) => {
});
app.post("~", (req, res) => {
});
```
Finally, start server by calling listen method.
```
app.listen(port, () => {
  console.log("app started to listen on " + port);
});
```
### client side
### 1. define client_logic.js
For the client side, you have to implement a single file : client_logic.js.
client_logic has to implement logic.sync_callback(resp);
```
// for example,
var logic = {
  sync_callback : function (resp) {
    console.log(resp);
  }
}
```
This callback function is called when server's synchronization data has arrived.
Parameter 'resp' has the following structure.
```
// this is a javascript array of objects
[
  {name: "sync_var1", value: some_value},
  {name: "sync_var2", value: some_value}, ...
]
```
Note that size of the array maybe different for each call because sync_rate of each variables are different.
### 2. make html files
In the html files, include srcipt by
```
<script src="script/client_logic.js"></script>
<script src="script/we_client.js"></script>
```
(Above is just an example)
Then call initailization function.
```
// ep_prefix + slash
we_client.init("we_api/");
```
init function also issues jwt. jwt is stored in we_client object.
To start a new environment, we_client.start_env with a callback function.
```
we_client.start_env((id) => {
  console.log("environment with id : " + id + " has started");
});
```
Note that init function is a async function. So you may fail to create a new environment if you execute start_env right after init function call.
Start sync loop by calling sync function with sync period(in milliseconds)
```
we_client.sync(300);
```
You can send a message to the server by calling action method.
```
// action_id : integer > 0
// paraemters : any parameters.
we_client.action(action_id, [parameters], callback);
```
action_id / parameters are delivered to message_arrived methods in logic.js
You can join to existing environment by join_env
```
we_client.join_env(callback);
```
Also, you need to call init function first to join. Furthermore, you need to assign an environment id to we_client before calling join_env.
```
we_client.env_id = "env_id returned by start_env";
```
After join_env, you need to call we_client.sync to start a synchronization loop.
# Issues
* Kicking out disconnected user may cause race condition. Lock will be used later.

# Examples
Will be updated at examples/ directory. Currently available examples:
* chat : simple chat service.

# License
Please refer to the LICENSE file.
