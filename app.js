var express = require('express');  
var app = express(); 
var bodyParser = require('body-parser'); 
var server = require('http').createServer(app);  
var io = require('socket.io')(server);
const port = process.env.PORT || 3000;
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

var rooms = [];
var messages = {};
var messages1 = {};
var mongojs = require('mongojs');
const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = 'mongodb://Mikele11:face112358@ds119688.mlab.com:19688/reactlist';

app.get('/', function(req, res,next) {  
    res.sendFile(__dirname + '/index.html');
});

function unique(arr) {
	var obj = {};
	for (var i = 0; i < arr.length; i++) {
		var str = arr[i];
		obj[str] = true; 
	}
	
	return Object.keys(obj); 
};

MongoClient.connect(MONGO_URL, function(err, db){  
  if (err) {
    return console.log(err);
  }
   app.get('/reactlist', function (req, res) {
        db.collection("reactlist").find({}).toArray(function(error, doc) {
            if (err) throw error;
            res.send(doc);
            messages = doc;       
            for (var i = 0; i < messages.length; i++) {
                    rooms[i] = messages[i].room_id;
            }
			rooms = unique(rooms);
			console.log('rooms==>',rooms)
        });
    });

   io.on('connection', (socket) => {
		//io.emit('fetch rooms', rooms);

		socket.on('create room', (data) => {
			rooms.push(data.room_id);
			socket.join(data.room_id);
			io.emit('fetch rooms', rooms);
		});
		
		socket.on('join', (data) => {
			socket.join(data.room_id);
			app.get('/reactlist', function (req, res) {
				db.collection("reactlist").find({}).toArray(function(error, doc) {
					if (err) throw error;
					res.send(doc);
					messages = doc;       
					for (var i = 0; i < messages.length; i++) {
							rooms[i] = messages[i].room_id;
					}
					rooms = unique(rooms);
					io.emit('fetch rooms', rooms);
				});
			})
		});

		socket.on('fetch message', (room_id) => {			
			var messend=[];
		    var j=0;
			for (var i = 0; i < messages.length; i++) {
				if (messages[i].room_id == room_id){
					messend[j] = messages[i].log;
					j++;
				}
			}
/*
			console.log('*********');
					console.log('.messend',messend);
			console.log('*********');
*/			
			io.to(socket.id).emit('chat message init', messend);//messages[room_id]
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

			app.post('/reactlist', function (req, res) {
				db.collection("reactlist").insertOne(req.body, function(err, doc) {
				  if (err){
					console.log('.post/error',error);					
				  } 
				  res.json(doc);
				});
			  });

		});

	});//socet

}); 


console.log('server on port 3000');
server.listen(port);  
