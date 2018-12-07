// Configuration
const secret = "Top Secret";
const ep_prefix = "/we_api";
const port = 6033;
const config_path = __dirname + "/settings";
const timeout_check = 5000;

const fs = require('fs');
const server = require('../../server/server');

const app = server.init_server(secret, ep_prefix, config_path, timeout_check);

app.get("/", (req, res) => {
	const index = fs.readFileSync("index.html");
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write(index);
	return res.end();
});
app.get("/join", (req, res) => {
	const join = fs.readFileSync("join.html");
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write(join);
	return res.end();
});

app.get("/script/:resName", (req, res) => {
	res.writeHead(200, {'Content-Type': 'text/javascript'});

	if(req.params.resName == "we_client.js") {
		res.write(fs.readFileSync("../../client/" + req.params.resName));
	} else {
		res.write(fs.readFileSync(req.params.resName));
	}

	return res.end();
});

app.get("/sprites/:resName", (req, res) => {
	res.writeHead(200, {'Content-Type': 'text/javascript'});

	res.write(fs.readFileSync("sprites/" + req.params.resName));

	return res.end();
});

app.listen(port, () => {
    console.log("app started to listen on " + port);
});
