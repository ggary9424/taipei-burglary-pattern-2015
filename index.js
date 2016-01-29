var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
handle["/"] = requestHandlers.test;
handle["/test"] = requestHandlers.test;
handle["loading"] = requestHandlers.loading;
handle["other"] = requestHandlers.other;

server.start(router.route, handle);