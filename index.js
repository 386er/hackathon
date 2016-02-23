var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var projectId = process.env.GCLOUD_PROJECT_ID; // E.g. 'grape-spaceship-123'
var auth = process.env.GCLOUD_AUTH_FILE
var topicName = process.env.PUBSUB_TOPIC
var policy = process.env.PUBSUB_POLICY

var pubsub = require('gcloud').pubsub({
  projectId: projectId,
  keyFilename: auth
});
// Reference a topic that has been previously created.
var topic = pubsub.topic(topicName);
var subscription = topic.subscription('gps_subscription', {
	autoAck: true,
	interval: 10
});

var getRanNum = function() {
	var ranNum = 5 + Math.random() * 390;
	return ranNum;
}

var getNewDataPoint = function() {
	var NewData = {'x':getRanNum(), 'y':getRanNum()}
	return NewData;
};


io.on('connection', function (socket) {

	function poll() {
		subscription.pull(function(err, messages) {
			if (err) {
				console.log(err)
			} else {
				// send data
				console.log(messages[messages.length - 1 ])
				socket.volatile.emit('new gps', messages[messages.length - 1 ].data);
			}
		});
	}
	function onError(err) { console.log(err)}
	function onMessage(message) {
		console.log(message);
		socket.volatile.emit('new gps', message.data);
	}
	subscription.exists(function(err, exists) {
		if (!exists) {
			subscription.create(function(err, subscription) {
				// Register listeners to start pulling for messages.
				console.log("Creating subscription")
				subscription.on('error', onError);
				subscription.on('message', onMessage);
				
				// setInterval(function () {
				// 	poll();
				// }, 500);
			});
		} else {
			subscription.on('error', onError);
			subscription.on('message', onMessage);
			// setInterval(function () {
			// 	poll();
			// }, 500);
		}

	});
  setInterval(function () {
      socket.volatile.emit('new data', getNewDataPoint());
	}, 500);
});


app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.get('/gps', function(req, res){

});


http.listen(3000, function(){
  console.log('listening on *:3000');
});

