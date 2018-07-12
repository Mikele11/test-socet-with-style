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
var mongojs = require('mongojs');
const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = 'mongodb://Mikele11:face112358@ds119688.mlab.com:19688/reactlist';

app.get('/', function(req, res,next) {  
    res.sendFile(__dirname + '/index.html');
});

MongoClient.connect(MONGO_URL, function(err, db){  
  if (err) {
    return console.log(err);
  }
   app.get('/reactlist', function (req, res) {
        db.collection("reactlist").find({}).toArray(function(error, doc) {
            if (err) throw error;
            res.send(doc);
            messages = doc;       
            for (var key in messages) {
                rooms[key];
            }
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
					for (var key in messages) {
						rooms[key];
					}
					console.log('rooms');
					console.log(rooms);
					console.log('rooms');
					io.emit('fetch rooms', rooms);
				});
			})
		});

		socket.on('fetch message', (room_id) => {

			app.get('/reactlist', function (req, res) {
				db.collection("reactlist").find({rooms:room_id}).toArray(function(error, doc) {
					if (err) throw error;
					console.log('.+error',error);
					console.log('.doc',doc);
					res.send(doc);
					//db.close();
				});
			});
			
			var messend=[];
			
			for (var i = 0; i < messages.length; i++) {
				if (messages[i].room_id == room_id){
					messend[i] = messages[i].log;
				}
			}			
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
			console.log('post app');
			app.post('/reactlist', function (req, res) {
				db.collection("reactlist").insertOne(req.body, function(err, doc) {
				  if (err){
					console.log('.post/error',error);					
				  } 
				  res.json(doc);
				  console.log('post..doc',doc);
				  //db.close();
				});
			  });

		});

	});//socet

}); 



console.log('server on port 3000');
server.listen(port);  