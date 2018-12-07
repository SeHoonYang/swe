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
	reg_new_answer(env);
};

exports.join_member = function(env, client_id) {
	// called when a new member join

	// Generate user name
	const adjectives = ["hungry", "angry", "gentle", "kind", "reliable", "cynical", "polite", "amiable", "compassionate", "generous", "happy"];
	const animals = ["petaurista", "starfish", "humpback", "cachalot", "gibbon", "sloth", "turtle", "hawk", "crow", "swallow", "penguin", "cow", "pig", "cat", "dog"];
	const generated_name = adjectives[Math.floor(Math.random() * adjectives.length)] + " " + animals[Math.floor(Math.random() * animals.length)];

	// Register user to sync variables / server variables
	env.sync_vars.get("user_list").value.push(generated_name);
	env.server_vars.get("user_map").set(client_id, generated_name);
};

exports.message_arrived = function(env, client_id, action_id, arguments) {
	// called when a client sends an action
	if (action_id == 1) {
		env.register_sig_var("draw", arguments, true);
	} else if (action_id == 2) {
		env.register_sig_var("clear", [], true);
	} else if (action_id == 3) {
		const user_name = env.server_vars.get("user_map").get(client_id);
		env.register_sig_var("chat", user_name + " : " + arguments[0]);
	} else if (action_id == 4) {
		const user_name = env.server_vars.get("user_map").get(client_id);
		const answer = env.server_vars.get("answer")
		const sub = arguments[0].toLowerCase();

		if(answer == sub) {
			env.register_sig_var("sys_chat","<h6><span class='text-primary'>" + user_name + "</span><span> suggested </span><span class='text-info'>'" + sub + "'</span><span> as the answer.</span><span class='text-success'> Correct!</span></h6>");

			reg_sigvar(env, client_id, {name:"correct", value:true});
			reg_new_answer(env);
		} else {
			env.register_sig_var("sys_chat","<h6><span class='text-primary'>" + user_name + "</span><span> suggested </span><span class='text-info'>'" + sub + "'</span><span> as the answer.</span><span class='text-danger'> Wrong!</span></h6>");
		}
	}
};

exports.timeout = function(env, client_id) {
	const user_name = env.server_vars.get("user_map").get(client_id);
	const user_list = env.sync_vars.get("user_list").value;

	// remove from sync list
	user_list.splice(user_list.indexOf(user_name), 1);

	// remove from server list
	env.server_vars.get("user_map").delete(client_id);
}

function generate_word() {
	// words from https://www.talkenglish.com/vocabulary/top-1500-nouns.aspx
	const dict = ["people", "history", "way", "art", "world", "information", "map", "two", "family", "government", "health", "system", "computer", "meat", "year", "thanks", "music", "person", "reading", "method", "data", "food", "understanding", "theory", "law", "bird", "literature", "problem", "software", "control", "knowledge", "power", "ability", "economics", "love", "internet", "television", "science", "library", "nature", "fact", "product", "idea", "temperature", "investment", "area", "society", "activity", "story", "industry", "media", "thing", "oven", "community", "definition", "safety", "quality", "development", "language", "management", "player", "variety", "video", "week", "security", "country", "exam", "movie", "organization", "equipment", "physics", "analysis", "policy", "series", "thought", "basis", "boyfriend", "direction", "strategy", "technology", "army", "camera", "freedom", "paper", "environment", "child", "instance", "month", "truth", "marketing", "university", "writing", "article", "department", "difference", "goal", "news", "audience", "fishing", "growth", "income", "marriage", "user", "combination", "failure", "meaning", "medicine", "philosophy", "teacher", "communication", "night", "chemistry", "disease", "disk", "energy", "nation", "road", "role", "soup", "advertising", "location", "success", "addition", "apartment", "education", "math", "moment", "painting", "politics", "attention", "decision", "event", "property", "shopping", "student", "wood", "competition", "distribution", "entertainment", "office", "population", "president", "unit", "category", "cigarette", "context", "introduction", "opportunity", "performance", "driver", "flight", "length", "magazine", "newspaper", "relationship", "teaching", "cell", "dealer", "finding", "lake", "member", "message", "phone", "scene", "appearance", "association", "concept", "customer", "death", "discussion", "housing", "inflation", "insurance", "mood", "woman", "advice", "blood", "effort", "expression", "importance", "opinion", "payment", "reality", "responsibility", "situation", "skill", "statement", "wealth", "application", "city", "county", "depth", "estate", "foundation", "grandmother", "heart", "perspective", "photo", "recipe", "studio", "topic", "collection", "depression", "imagination", "passion", "percentage", "resource", "setting", "ad", "agency", "college", "connection", "criticism", "debt", "description", "memory", "patience", "secretary", "solution", "administration", "aspect", "attitude", "director", "personality", "psychology", "recommendation", "response", "selection", "storage", "version", "alcohol", "argument", "complaint", "contract", "emphasis", "highway", "loss", "membership", "possession", "preparation", "steak", "union", "agreement", "cancer", "currency", "employment", "engineering", "entry", "interaction", "mixture", "preference", "region", "republic", "tradition", "virus", "actor", "classroom", "delivery", "device", "difficulty", "drama", "election", "engine", "football", "guidance", "hotel", "owner", "priority", "protection", "suggestion", "tension", "variation", "anxiety", "atmosphere", "awareness", "bath", "bread", "candidate", "climate", "comparison", "confusion", "construction", "elevator", "emotion", "employee", "employer", "guest", "height", "leadership", "mall", "manager", "operation", "recording", "sample", "transportation", "charity", "cousin", "disaster", "editor", "efficiency", "excitement", "extent", "feedback", "guitar", "homework", "leader", "mom", "outcome", "permission", "presentation", "promotion", "reflection", "refrigerator", "resolution", "revenue", "session", "singer", "tennis", "church", "coffee", "lab", "orange", "police"];
	
	return dict[Math.floor(Math.random() * dict.length)];
}

function reg_new_answer(env) {
	const new_answer = generate_word();
	env.server_vars.set("answer", new_answer);

	reg_sigvar(env, env.issuer, {name:"new_answer", value:new_answer});
}

function reg_sigvar(env, id, val) {
	if(env.signal_vars.get(id) == undefined)
		env.signal_vars.set(id, [val]);
	else
		env.signal_vars.get(id).push(val);
}
