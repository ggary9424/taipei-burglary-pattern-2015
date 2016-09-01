var exec = require("child_process").exec;
var	fs = require('fs');

function index(response) {
	console.log("test: function");
	fs.readFile('web/html/index.html', function(err, html) {
		if (err) {
			response.writeHead(200, {'Content-Type': 'text/css'});
			response.write('404 NOT FOUND');
			response.end();
			throw err; 
		}
		else {
			response.writeHeader(200, {"Content-Type": "text/html"});
			response.write(html);
			response.end();
		}
	});
}

function loading(response) {
	console.log("loading");
	fs.readFile('web/html/loading.html', function(err, html) {
        if (err) {
			response.writeHead(200, {'Content-Type': 'text/css'});
			response.write('404 NOT FOUND');
			response.end();
			return false;
		}
		else {			
			response.writeHead(200, {'Content-Type': 'text/html'});
			response.write(html);
			return true;
		}	
	});
}

function other(response, pathname) {
	console.log("other: "+pathname);
	fs.readFile('.'+pathname, function(err, data) {
        if (err) {
			response.writeHead(200, {'Content-Type': 'text/css'});
			response.write('404 NOT FOUND');
			response.end();
			return false;
		}
		else {			
			response.write(data);
			response.end();
			return true;
		}	
	});
}

exports.index = index;
exports.loading = loading;
exports.other = other;
