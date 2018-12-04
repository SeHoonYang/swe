// Configuration
const secret = "Top Secret";
const ep_prefix = "/we_api";
const port = 6033;
const config_path = __dirname + "/settings";

const fs = require('fs');
const server = require('../../server/server');

const app = server.init_server(secret, ep_prefix, config_path);

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
	const script = fs.readFileSync("../../client/" + req.params.resName);
	res.writeHead(200, {'Content-Type': 'text/javascript'});
	res.write(script);
	return res.end();
});

app.listen(port, () => {
    console.log("app started to listen on " + port);
});
