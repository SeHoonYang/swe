const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.init_server = function (secret, ep_prefix, config_path, timeout_check) {

const logic = require(config_path + '/logic');

const environments = new Map();
const app = express();

// create environment
function make_env(issuer) {
	const new_env = new Object();
	new_env.issuer = issuer
	new_env.member = new Map();
	new_env.member.set(issuer, {counter:0, last_time:Date.now()});
	new_env.sync_vars = new Map();
	new_env.server_vars = new Map();
	new_env.signal_vars = new Map();

	new_env.register_sig_var = function (name, value, exclude_issuer) {
		for(member_id of this.member.keys()){
			if (exclude_issuer && this.issuer == member_id)
				continue;

			if (this.signal_vars.get(member_id) == undefined) {
				this.signal_vars.set(member_id, [{name:name, value:value}]);
			} else {
				this.signal_vars.get(member_id).push({name:name, value:value});
			}
		}
	}

	// read setting file
	const settings = JSON.parse(fs.readFileSync(config_path + "/env.json"));

	for(sync_variable of settings.sync_var) {
		new_env.sync_vars.set(sync_variable.name, {"value":sync_variable.value, "sync_rate":sync_variable.sync_rate});
	}
	for(server_variable of settings.server_var) {
		new_env.server_vars.set(server_variable.name, server_variable.value);
	}
	new_env.timeout = settings.timeout;

	return new_env;
}

// generate random hash
function issue_id(length) {
	return crypto.randomBytes(length).toString('base64').replace("==","").replace("=","");
}

// jwt validation function
function validation(req, res, callback) {
	const token = req.headers['access-token'];
	try {
		const decoded = jwt.verify(token, secret);
		const client = decoded.user_id;

		// pass user id to callback function
		callback(client);
	} catch(err) {
		// error named JsonWebTokenError is not a bug
		if(err.name != "JsonWebTokenError") {
			console.log(err);
		}
		res.json({"res": false});
	}
}

/*
 **********************************
 * Method	get_token
 * Request   	GET
 * Param	
 * Response	jwt with an indicator
 **********************************
 * This function issues new jwt
 */
app.get(ep_prefix + "/get_token", (req, res) => {
	// generate random single-use user id
	const user_id = issue_id(40);

	// issue token
	const token = jwt.sign(
		{
			user_id: user_id
		}, secret,
		{
			expiresIn: '1d'
		}
	);

	res.json({
		res : true,
		token
	});
});

/*
 **********************************
 * Method	sync
 * Request   	POST
 * Param	*ACCESS-TOKEN (jwt)
 * 		*ENV-ID (jwt)
 * Response	All outdated variables
 **********************************
 * This function returns up-to-date
 * values
 */
app.post(ep_prefix + "/sync", (req, res) => {
	const env = environments.get(req.headers['env-id']);

	// invalid environment id
	if (env == undefined) {
		return res.json({"res" : false});
	}

	// need protection for DoS like attack
	validation(req, res, (client) => {
		const payload = [];

		// send sync variables
		for (vars of env.sync_vars){
			if (env.member.get(client).counter % vars[1].sync_rate == 0) {
				payload.push({name:vars[0], value:vars[1].value});
			}
		}

		// send signal variables
		if(sig_vars = env.signal_vars.get(client)) {
			for (vars of sig_vars){
				payload.push(vars);
			}
		}

		// may causes race condition
		env.signal_vars.delete(client);

		// increase sync counter, update alive
		env.member.set(client, {counter:env.member.get(client).counter + 1, last_time:Date.now()});

		res.json(payload);
	});
});

/*
 **********************************
 * Method	start
 * Request   	POST
 * Param	*ACCESS-TOKEN (jwt)
 * Response	environment id
 **********************************
 * Start new sync environment
 */
app.post(ep_prefix + "/startenv", (req, res) => {
	validation(req, res, (client) => {
		const env_id = issue_id(40);
		const env = make_env(client);
		environments.set(env_id, env);

		// run logic - initialization
		logic.start_env(env, client);
		logic.join_member(env, client);

		res.json({
			res: true,
			id: env_id
		});
	});
});

/*
 **********************************
 * Method	joinenv
 * Request   	POST
 * Param	*ACCESS-TOKEN (jwt)
 *              *ENV-ID
 * Response	initial sync variables
 **********************************
 * Start new sync environment
 */
app.post(ep_prefix + "/joinenv", (req, res) => {
	const env = environments.get(req.headers['env-id']);
	if (env == undefined) {
		return res.json({"res" : false});
	}

	validation(req, res, (client) => {
		env.member.set(client, {counter:0, last_time:Date.now()});

		// run logic - member joined
		logic.join_member(env, client);

		res.json({"res" : true});
	});
});


// body parser, require content-type:application/json
app.use(ep_prefix + "/action", express.json());

/*
 **********************************
 * Method	action
 * Request   	POST
 * Param	*ACCESS-TOKEN (jwt)
 *              *ENV-ID
 *              action_id
 *              parameters
 * Response	result
 **********************************
 * Update environment
 */
app.post(ep_prefix + "/action", (req, res) => {
	const env = environments.get(req.headers['env-id']);

	if (!env) {
		return res.json({"res":false});
	}

	validation(req, res, (client) => {
		// run logic - client post action
		const action = req.body.action_id;
		const parameters = req.body.parameters;
		if (!action || !parameters) {
			return res.json({"res":false});
		}

		logic.message_arrived(env, client, action, parameters);

		res.json({"res":true});
	});
});

/*
 **********************************
 * Method	getenvlist
 * Request   	GET
 * Param	
 * Response	environments list
 **********************************
 * Retreive environments
 */
app.get(ep_prefix + "/getenvlist", (req, res) => {
	const lists = new Array();

	for (env of environments){
		lists.push({id: env[0], member: env[1].member.size});
	}
	return res.json(lists);
});

// start user-timeout checker
setInterval(function(){
	for(env of environments) {
		for(member of env[1].member) {
			if (member[1].last_time + env[1].timeout * 1000 < Date.now()) {
				// call timeout logic
				logic.timeout(env[1], member[0]);

				// remove from the member list
				env[1].member.delete(member[0]);

				// remove signal variables
				env[1].signal_vars.delete(member[0]);
			}
		}

		// delete environments if every member kicked
		if(env[1].member.size == 0) {
			environments.delete(env[0]);
		}
	}
}, timeout_check);

return app;
};
