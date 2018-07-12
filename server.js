var http = require('http');
//var socketio = require('socket.io');
var fs = require('fs');
var express = require('express');
var app = express();
const port = process.env.PORT || 3000;

/*
var server = http.createServer((req, res) => {

    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    res.end(fs.readFileSync('./public/index.html', 'utf-8'));	

}).listen(port);
*/

//------------------------------------------------------------------------------

var server = http.createServer(app);  
var socketio = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));  
app.get('/', function(req, res,next) {  
    res.sendFile(__dirname + '/index.html');
});

server.listen(port);  



//------------------------------------------------------------------------------

//var server = app.listen(port);
console.log('server 3000')

var rooms = [];
var messages = {};
var io = socketio.listen(server);

var mongojs = require('mongojs');
//var db = mongojs('chat', ['chat']);
const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = 'mongodb://Mikele11:face112358@ds153413.mlab.com:53413/bookday';

MongoClient.connect(MONGO_URL, function(err, db){  
  if (err) {
    return console.log(err);
  }
  /*
	//var db = client.db('mytestingdb');  
	app.get('/chat', function (req, res) {
		db.collection("chat").find({}).toArray(function(error, doc) {
			if (err) throw error;
			res.send(doc);
			//db.close();
		});
	});

	app.post('/chat', function (req, res) {
	  console.log(req.body);
	  db.collection("chat").insertOne(req.body, function(err, doc) {
		if (err) throw err;
		res.json(doc);
		//db.close();
	  });
	});
	
	app.delete('/chat/:id', function (req, res) {
	  var id = req.params.id;
	  console.log(id);
	  db.collection("chat").remove({_id: mongojs.ObjectId(id)}, function (err, doc) {
		res.json(doc);
		//db.close();
	  });
	});
    */
   app.get('/chat', function (req, res) {
        db.collection("chat").find({}).toArray(function(error, doc) {
            if (err) throw error;
            res.send(doc);
            messages = doc;
           
            for (var key in messages) {
                rooms[key];
            }
            //db.close();
        });
    });

   io.on('connection', (socket) => {

    io.emit('fetch rooms', rooms);

    socket.on('create room', (data) => {
        rooms.push(data.room_id);
        socket.join(data.room_id);
        io.emit('fetch rooms', rooms);
        console.log('rooms..',rooms)
    });

    socket.on('join', (data) => {
        socket.join(data.room_id);
        io.emit('fetch rooms', rooms);
    });

    socket.on('fetch message', (room_id) => {

        app.get('/chat', function (req, res) {
            console.log('All right');
            db.collection("chat").find({rooms:room_id}).toArray(function(error, doc) {
                if (err) throw error;
                res.send(doc);
                //db.close();
            });
        });

        io.to(socket.id).emit('chat message init', messages[room_id]);
    });

    socket.on('chat message', (data) => {
        messages[data.room_id] = messages[data.room_id] || [];
        var log = {
            user_name: data.user_name,
            message: data.message
        };
        messages[data.room_id].push(log);
        io.to(data.room_id).emit('chat message', {
            room_id: data.room_id,
            log: log
        });

        app.post('/chat/', function (req, res) {
            console.log(req.body);
            db.collection("chat").insertOne(req.body, function(err, doc) {
              if (err) throw err;
              res.json(doc);
              //db.close();
            });
          });

        console.log('messages..',messages)
    });


});

    





});
