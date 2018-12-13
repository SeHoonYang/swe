var we_client = {
	// Attirbutes
	endpoint : "",
	access_token : "",
	env_id : "",
	token_issued : false,
	client_sync_vars : new Map(),
	sync_counter : 1,

	// Methods

	// Initializer
	init : function(root, callback) {
		this.endpoint = root;
		this.__get_token(callback);
	},

	// Start Sync
	sync : function(interval) {
		setInterval(function(client) {
			client.ajax("POST", "sync", logic.sync_callback);
		}, interval, this);
	},

	__get_token: function(callback) {
		this.ajax("GET", "get_token", function (resp) {
			if(resp.res) {
				this.access_token = resp.token;
			}

			this.token_issued = true;
			
			if (callback) {
				callback();
			}
		}.bind(this));
	},

	// Make an ajax call
	ajax : function(method, uri, callback, args) {
		const xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				callback(JSON.parse(this.response));
			}
		};
		xhttp.open(method, this.endpoint + uri, true);
		xhttp.setRequestHeader("Content-Type", "application/json");
		xhttp.setRequestHeader("access-token", this.access_token);
		xhttp.setRequestHeader("env-id", this.env_id);

		if(uri == "action") {
			const payload = {action_id:args[0], parameters:args[1]};
			xhttp.send(JSON.stringify(payload));
		} else if(uri == "sync") {
			const payload = [];
			this.client_sync_vars.forEach(function(value,key,mapObj) {
				if (this.sync_counter % value.sync_rate == 0) {
					payload.push({name:key, value:value.value});
				}
			}.bind(this));
			xhttp.send(JSON.stringify(payload));
			this.sync_counter += 1;
		} else {
			xhttp.send(); 
		}
	},

	// Start environment
	start_env : function(callback) {
		this.ajax("POST", "startenv", function (resp) {
			if(resp.res) {
				this.env_id = resp.id;
				callback(resp.id);
			}
		}.bind(this));
	},

	// Join environment
	join_env : function(callback) {
		this.ajax("POST", "joinenv", function (resp) {
			callback(resp.res);
		}.bind(this));
	},

	// Send action
	action : function(action_id, parameters, callback) {
		this.ajax("POST", "action", function (resp) {
			if (callback) {
				callback(resp.res);
			}
		}.bind(this), [action_id, parameters]);
	},

	// Register client sync variable
	register_syncvar : function(name, init_value, sync_rate) {
		this.client_sync_vars.set(name, {value : init_value, sync_rate : sync_rate});
	},

	// Delete client sync variable
	delete_syncvar : function(name) {
		this.client_sync_vars.delete(name);
	},

	// Update client sync variable
	update_syncvar : function(name, value) {
		this.client_sync_vars.get(name).value = value;
	}
};
