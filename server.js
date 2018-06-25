var express = require("express");
var Twit = require('twit');

// Config file with Twitter API keys.
var config = require("./config");

var T = new Twit(config);
var app = express();

// Defining server port number.
var port = 3001;
console.log("Starting on port " + port + "...");

// Setting these headers to allow browser access control blocking.
app.use(function (req, res, next) {
	// Website you wish to allow to connect
	res.setHeader('Access-Control-Allow-Origin', '*');
	
	// Request methods you wish to allow
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT,    PATCH, DELETE');
	
	// Request headers you wish to allow
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	
	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	res.setHeader('Access-Control-Allow-Credentials', true);
	
	// Pass to next layer of middleware
	next();	
});


// Default GET route.
app.get('/', function (req, res) {
	res.send("Not a valid path. This API accepts GET requests only. Format must be '/api/q=...'");
	// res.render("./build/index.html");
});

// API GET route.
app.get('/api/q=*', function (req, res) {
	// Cleaning up query text for Twit.
	cleanQuery = req.url.replace("/api/q=", "");
	cleanQuery = cleanQuery.replace("+", " ");
	
	// Twit parameters.
	var params = {
		q: cleanQuery,
		count: 100
	}

	var results = [];

	// Gettting 'count' number of Tweets from Twit and passing into Python ML script for results.	
	T.get('search/tweets', params, function(err, data, response) {
		// Parsing only tweet text.
		var tweets = [];
		for(var i = 0; i < data.statuses.length; i++){
			tweets[i] = data.statuses[i].text + " \n ROW ";
		}

		// Running Python ML backend with Pyshell.
		var PythonShell = require('python-shell');
		var pyshell = new PythonShell('backend/predictText.py');

		// Sends a message to the Python script via stdin.
		pyshell.send(tweets);

		// Recieves result from the Python script via 'print' statement.
		pyshell.on('message', function (message) {
			results = message;
			
		});
		
		// Ending input stream and exiting the process.
		pyshell.end(function (err,code,signal) {
			// Throw error if failure;
			if (err) throw err;

			// Send results.
			else {
				res.send(results);
				res.end();
			}
		});
	});
});

// Redirecting any other requested routes.
app.use(function(req, res) {
    res.redirect('/');
});

// Server port listener.
app.listen(port, function(){
	console.log("Server started on port " + port);
});

