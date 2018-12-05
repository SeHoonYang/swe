// parameter client_id
//
//	* 40 length string client-id
//
// parameter env
//
// 	environment instance
//
//	env.member : map<member_id, {counter, last_time}>
//	env.sync_vars : sync_var defined in env.json are stored
//	env.server_vars : server_var defined in env.json are stored
//
// parameter action_id / arguments
//
// 	parameters passed by client
//

// example implementation of start_env / join_member / message_arrived function

exports.start_env = function(env, client_id) {
	// called when a new environment is established
	env.server_vars.set("user_map", new Map());
};

exports.join_member = function(env, client_id) {
	// called when a new member joins

	// Generate user name
	const adjectives = ["hungry", "angry", "gentle", "kind", "reliable", "cynical", "polite", "amiable", "compassionate", "generous"];
	const animals = ["petaurista", "starfish", "humpback", "cachalot", "gibbon", "sloth", "turtle", "hawk", "crow", "swallow"];
	const generated_name = adjectives[Math.floor(Math.random() * adjectives.length)] + " " + animals[Math.floor(Math.random() * animals.length)];

	// Register user to sync variables / server variables
	env.sync_vars.get("user_list").value.push(generated_name);
	env.server_vars.get("user_map").set(client_id, generated_name);
};

exports.message_arrived = function(env, client_id, action_id, arguments) {
	// called when a client sends an action
	const user_name = env.server_vars.get("user_map").get(client_id);
	env.sync_vars.get("chat").value.push(user_name + " : " + arguments[0]);
};

exports.timeout = function(env, client_id) {
	const user_name = env.server_vars.get("user_map").get(client_id);
	const user_list = env.sync_vars.get("user_list").value;

	// remove from sync list
	user_list.splice(user_list.indexOf(user_name), 1);

	// remove from server list
	env.server_vars.get("user_map").delete(client_id);
}
