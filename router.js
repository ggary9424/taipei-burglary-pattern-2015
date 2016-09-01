var qs = require('querystring');
var url = require('url');
var req_hand = require('./requestHandlers');
var exec = require('child_process').exec;

function route(handle, pathname, request, response) {
	if (typeof handle[pathname] === 'function') {
		var method = request.method;
		if (method == 'GET') {
			var param = qs.parse(url.parse(request.url).query);
			var T_v = parseFloat(param['T'])*60*60*24;
			var R_v = Math.pow(parseFloat(param['R']),3);
			if (R_v > 0 && R_v <= 125 && T_v >= 0 && T_v <= (30*60*60*24) && param['done'] != 1) {
				console.log("Spark start! T=" + T_v.toString() + ", R=" + R_v.toString());
				command = "spark-submit calPattern.py " 
							+ T_v.toString() + " " + R_v.toString();
				exec(command, {maxBuffer:1024*1024*1024}, function(error, out) {
					if (error) {
						console.log(error);
						throw error;
					}
					console.log("Spark Done! T=" + T_v.toString() + ", R="+R_v.toString());
					response.write('<script>');
					response.write('window.location = "index?T=' 
									+ param['T'] + '&R=' + param['R'] + '&done=1";');
					response.write('</script>');
					response.end();
				});
				handle['loading'](response);
			}
			else if (parseInt(param['done']) == '1') {
				handle[pathname](response);
			}
			else {
				handle[pathname](response);
			}
		}
		else {
			handle[pathname](response);
		}
	}
	else {
		if (handle["other"](response, pathname) == false) {
			process.exit();
		}
	}
}

exports.route = route;
