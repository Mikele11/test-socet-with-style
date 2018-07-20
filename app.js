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
var users=[];
var usersOnline=[];
var user_current;
var mongojs = require('mongojs');
const MongoClient = require('mongodb').MongoClient;
const MONGO_URL = 'mongodb://Mikele11:face112358@ds119688.mlab.com:19688/reactlist';
const MONGO_URL2 = 'mongodb://Mikele11:face112358@ds137631.mlab.com:37631/userlistsocet';
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
	
//------початок видалення
	app.delete('/reactlist', function (req, res) {
		var id = req.body.id;
		db.collection("reactlist").remove({_id: mongojs.ObjectId(id)}, function (err, doc) {
			res.json(doc);
		});
    });
//-----кінець видалення	
	
	
	

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
					messend[j] = messages[i];
					j++;
				}
			}
		
			io.to(socket.id).emit('chat message init', messend);//messages[room_id]
		});

		socket.on('chat message', (data) => {
			messages[data.room_id] = messages[data.room_id] || [];
			var log = {
				user_avatar: data.user_avatar,
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
		//----------------------------------отрисовка юзера
/*
		socket.on('remember user', (user) => {
			console.log('user_current');
			console.log(user);
			console.log('user_current');
			
			
			socket.user = user;
			user_current = user;
			changeColors();
		});
	
		function changeColors() {
			io.sockets.emit('change',user_current);
		}
		function oldColors() {
			io.sockets.emit('oldcolors',user_current);
		}		
		socket.on('disconnect', function (user_current) {
			oldColors();
		});
*/
		Array.prototype.remove = function(value) {
			var idx = this.indexOf(value);
			if (idx != -1) {
				// Второй параметр - число элементов, которые необходимо удалить
				return this.splice(idx, 1);
			}
			return false;
		}
		
		socket.on('remember user', (user) => {
			console.log('user_current');
			console.log(user);
			console.log('user_current');
			
			
			socket.user = user;
			usersOnline.push(user);
			usersOnline = unique(usersOnline);
			changeColors();
		});
	
		function changeColors() {
			io.sockets.emit('change',usersOnline);
		}
		function oldColors() {
			io.sockets.emit('oldcolors',usersOnline);
		}		
		socket.on('disconnect', function () {
			//usersOnline.remove[user_current];
			usersOnline.splice(usersOnline.indexOf(socket.user), 1);
			oldColors();
		});	
	   
	   
	   
	   
	   
	   
	   
	   
		//-------------------------кінець отрисовки
		
		
	});//socet

}); 


	
	MongoClient.connect(MONGO_URL2, function(err, db){  
	  if (err) {
		return console.log(err);
	  }
	   app.get('/userlistsocet', function (req, res) {
			db.collection("userlistsocet").find({}).toArray(function(error, doc) {
				if (err) throw error;
				res.send(doc);
				users = doc;
			});
		});
		
		app.get('/userlistsocetsearch', function (req, res) {
			var fname1 = req.query.fname;
			db.collection("userlistsocet").find({user_name: fname1}).toArray(function(error, doc) {
			    if (err) throw error;
					console.log('doc',doc);
			    res.send(doc);
			});
	    	});
		
		app.post('/userlistsocet', function (req, res) {

			db.collection("userlistsocet").insertOne(req.body, function(err, doc) {
				if (err){
					console.log('.post/error',error);					
				} 
				res.json(doc);
			});
		});		

	});
	
	app.post('/search', function (req, res) {
		console.log('search>',req.body.word)
		console.log(req.body.word)
		const GoogleScraper = require('google-scraper');
		console.log('GoogleScraper>',GoogleScraper)
		if (req.body.word!== undefined){
			console.log('search>????',req.body.word)
			const options = {
			  keyword: req.body.word,//'mikele'
			  language: "ru",
			  tld:"ru",
			  results: 20
			};
			 
			const scrape = new GoogleScraper(options); 
			scrape.getGoogleLinks.then(function(doc) {
			  res.send(doc);
			  //res.json(doc);
			  console.log('++++');
			}).catch(function(e) {
			  console.log(e);
			})
		}
	});

console.log('server on port 3000');
server.listen(port);  
