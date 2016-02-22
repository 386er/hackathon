var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var getRanNum = function() {
	var ranNum = 5 + Math.random() * 390;
	return ranNum;
}

var getNewDataPoint = function() {
	var NewData = {'x':getRanNum(), 'y':getRanNum()}
	return NewData;
};

io.on('connection', function (socket) {
  setInterval(function () {
      socket.volatile.emit('new data', getNewDataPoint());
	}, 500);
});


app.get('/', function(req, res){
  res.sendfile('index.html');
});




http.listen(3000, function(){
  console.log('listening on *:3000');
});

