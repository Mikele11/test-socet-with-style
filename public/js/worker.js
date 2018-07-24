var url = "https://socetchat.herokuapp.com";//https://socetchat.herokuapp.com
var socket = io.connect(url);
var user_name = "";
var current_room = "";

var rooms=[];
var users=[];
var clearR=[];

function unique(arr) {
	var obj = {};
	for (var i = 0; i < arr.length; i++) {
		var str = arr[i];
		obj[str] = true; 
	}			
	return Object.keys(obj); 
};

function clearRooms (roo,usr){
	if (roo.length>=usr.length){
		var k=0;
		for (var i = 0; i < roo.length; i++) {
			
			if (usr.indexOf(roo[i]) === -1){
				clearR[k]=roo[i]
				k++;
			}
		}
	} else return false;
}

$.ajax({
	url: "/userlistsocet",
	type: "GET",
	data: '',
	cache: false,
	success: function(response){
		for (var i = 0; i < response.length; i++) {
				users[i] = response[i].user_name;
		}
		console.log('users get',users); 
	}
});

$.ajax({
	url: "/reactlist",
	type: "GET",
	data: '',
	cache: false,
	success: function(response){
		for (var i = 0; i < response.length; i++) {
			rooms[i] = response[i].room_id;
		}
		rooms = unique(rooms);
		clearRooms(rooms,users);
		console.log('clear room',clearR); 
		$('#room-list').empty();
		clearR.forEach((v) => {
			$('#room-list').append('<a href="#" class="list-group-item room-menu" data-room-id="' + v + '">' + v + '</a>');
		})                  
	}
});

$('#create-user').on('submit', () => {
	user_name = $('#input-user-name').val();
	$('#input-user-name').val("")
	$('#current_user_name').text(user_name);
	return false;
});

$('#create-room').on('submit', () => {
	socket.emit('create room', {
		room_id: $('#input-room-id').val(),
		user_name: user_name
	});
	current_room = $('#input-room-id').val();
	socket.emit('fetch messages', $('#input-room-id').val());
	$('#current_room_id').text($('#input-room-id').val());
	$('#input-room-id').val("");
	return false;
});

$('#post-message').on('submit', () => {
	var avatar;
	if ($('#picrscr').val()==''){
		avatar='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXPg-87YPJhgdeqQoAlUdgF60k6yi61LlpDtSXSqjWMVa9xbWVXQ';
	}else{
		avatar=$('#picrscr').val();
	}

	socket.emit('chat message', {
		room_id: current_room,
		user_avatar: avatar,		
		user_name: user_name,
		message: $('#input-message').val()
	});
	$('#input-message').val("");
	return false;
})




$('#post-search').on('submit', (e) => {
	e.preventDefault();
	var dat={"word":$('#input-search').val()}
	console.log('dat',dat);

	$.ajax({
		url: "/search",
		type: "POST",
		contentType: 'application/json',
		data: JSON.stringify(dat),
		cache: false,
		success: function(response){
			console.log('search',response);
			$('#search-list').empty();
			response.forEach((v) => {
				$('#search-list').append('<p>' +'<a href="'+ v+'">'+v+'</p>');
			})
			$('#search-list').append('<p class="сollapse">'+'<span class="caret-up"></span>' +'<span>'+'Згорнути'+'</span>');
		},
		error: function( jqXhr, textStatus, errorThrown ){
			console.log(  jqXhr )
			console.log(  textStatus )
			console.log(  errorThrown )
		}

	});
})

$(document).on('click', '.сollapse', (ev) => {
	$('#search-list').empty();
});



//зміна кімнати

$(document).on('click', '.room-menu', (ev) => {
	current_room = $(ev.currentTarget).attr('data-room-id');
	socket.emit('join', {
		room_id: current_room,
		user_name: user_name
	});
	
	$.ajax({
		url: "/reactlist",
		type: "GET",
		data: '',
		cache: false,
		success: function(response){
			for (var i = 0; i < response.length; i++) {
				rooms[i] = response[i].room_id;
			}
			rooms = unique(rooms);
			clearRooms(rooms,users);
			$('#room-list').empty();
			clearR.forEach((v) => {
				$('#room-list').append('<a href="#" class="list-group-item room-menu" data-room-id="' + v + '">' + v + '</a>');
			}) 			 
		}
	});
							
	socket.emit('fetch message', current_room);
	$('#current_room_id').text(current_room);
	return false;
});

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
$(document).on('click', '.userp', (ev) => {
	current_user = $(ev.currentTarget).text();

	
	
	socket.emit('create room', {
		room_id: current_user,
		user_name: user_name
	});
	current_room = current_user;
	socket.emit('fetch messages', current_user);
	$('#current_room_id').text(current_user);
	$('#input-room-id').val("");
	
		
	console.log('click to user',current_user);
	if (current_user!=$('#response').text()){
		var value = prompt("Send message to"+current_user+"<br>...:)",'');
		var avatar;
		if ($('#picrscr').val()==''){
			avatar='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXPg-87YPJhgdeqQoAlUdgF60k6yi61LlpDtSXSqjWMVa9xbWVXQ';
		}else{
			avatar=$('#picrscr').val();
		}
		if ((value!==null)&&(value>'')){
			socket.emit('chat message', {
				room_id: current_user,
				user_avatar: avatar,		
				user_name: user_name,
				message: value
			});
		}
	}
	if (current_user==$('#response').text()){
		
		socket.emit('join', {
			room_id: current_user,
			user_name: user_name
		});
		
		$.ajax({
			url: "/reactlist",
			type: "GET",
			data: '',
			cache: false,
			success: function(response){
				console.log('success user');				
			}
		});								
		socket.emit('fetch message', current_user);
		$('#current_room_id').text(current_user);		
	}
	
	return false;
});
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//--------видалення поч

$(document).on('click', '.fa-trash', (ev) => {
	var id = $(ev.currentTarget)[0].children[0].innerHTML;
	var sender = {id: id};
	
	$.ajax({
		type: 'DELETE',
		data: JSON.stringify(sender),
		contentType: 'application/json',
		url: '/reactlist',						
		success: function(data) {
			console.log('success');			
		},
		error: function( jqXhr, textStatus, errorThrown ){
			console.log(  jqXhr )
			console.log(  textStatus )
			console.log(  errorThrown )
		}	
	});

	current_room = $('#current_room_id').text();
	socket.emit('join', {
		room_id: current_room,
		user_name: user_name
	});
	
	$.ajax({
		url: "/reactlist",
		type: "GET",
		data: '',
		cache: false,
		success: function(response){
			var j=0;
			var mess=[];
			for (var i = 0; i < response.length; i++) {
				if (current_room == response[i].room_id){
					mess[j] = response[i];
					j++;
				}	
			}
			$('#message-list').empty();
			mess.forEach((v) => {
				$('#message-list').append('<p>' +'<img class="useravatar" src="'+ v.log.user_avatar+'">'+ v.log.user_name + '：' + v.log.message + '&nbsp;&nbsp;&nbsp;<i class="fa fa-trash"><span class="idhiden">'+v._id+'</span></i>'+'</p>');
			});
		}
	});							
	return false;
});

//--------------------------видалення кінець

socket.on('fetch rooms', (rooms) => {
	$('#room-list').empty();
	clearRooms(rooms,users);
	clearR.forEach((v) => {
		$('#room-list').append('<a href="#" class="list-group-item room-menu" data-room-id="' + v + '">' + v + '</a>');
	})
});

socket.on('chat message', (data_doc) => {	
	$.ajax({
		type: 'POST',
		data: JSON.stringify(data_doc),
		contentType: 'application/json',
		url: '/reactlist',						
		success: function(data) {
			console.log('success');
		},
		error: function( jqXhr, textStatus, errorThrown ){
			console.log(  jqXhr )
			console.log(  textStatus )
			console.log(  errorThrown )
		}	
	});	
	if (current_room == data_doc.room_id) {
		$('#message-list').append('<p>' +'<img class="useravatar" src="'+ data_doc.log.user_avatar+'">'+ data_doc.log.user_name + '：' + data_doc.log.message + '&nbsp;&nbsp;&nbsp;<i class="fa fa-trash"><span class="idhiden">'+data_doc._id+'</span></i>'+'</p>');
	}

});
socket.on('chat message init', (messages) => {
	$('#message-list').empty();
	messages.forEach((v) => {
		$('#message-list').append('<p>' +'<img class="useravatar" src="'+ v.log.user_avatar+'">'+ v.log.user_name + '：' + v.log.message + '&nbsp;&nbsp;&nbsp;<i class="fa fa-trash"><span class="idhiden">'+v._id+'</span></i>'+'</p>');
		
	});
});

//----------------------------------------отрисовка
/*		
	socket.on('connect', function (){
		setTimeout(function(){
		console.log('sender',document.getElementById('response').innerText)
		socket.emit('remember user', $('#response').text());
		},5000);
	});
	
    socket.on('change', function (user){
		setTimeout(function(){
			if (navigator.onLine == true){
				console.log('on')
				//$('#user-list').css("background","greenyellow");
				var x = document.getElementsByClassName("userp").length;
				console.log( 'class',x);

				$('#user-list>p').each(function( index ) {
				  console.log( 'each user',user );	
				  console.log( index + ": " + $( this ).text() );
				  if ($( this ).text() == user){
					$( this ).css("background","greenyellow"); 
				  } 
				});			
			} else {
				console.log('off')
				$('#user-list>p').each(function( index ) {
				  console.log( 'each' );	
				  console.log( index + ": " + $( this ).text() );
				  if ($( this ).text() == user){
					$( this ).css("background","#d3d3eb");  
				  } 
				});
			}
		},5000);
    });
    socket.on('oldcolors', function (user){
		setTimeout(function(){
			console.log('off')
			$('#user-list>p').each(function( index ) {
			  console.log( 'each' );	
			  console.log( index + ": " + $( this ).text() );
			  if ($( this ).text() == user){
				$( this ).css("background","#d3d3eb");  
			  } 
			});
		},5000);
    });
*/
socket.on('connect', function (){
	setTimeout(function() {
		socket.emit('remember user', $('#response').text());
	},5000);
});

socket.on('change', function (usersOnline){
	setTimeout(function(){
		console.log('on online>',usersOnline)
		if (navigator.onLine == true){
			var x = document.getElementsByClassName("userp").length;
			$('#user-list>p').each(function( index ) {
			  if (usersOnline.indexOf($( this ).text() ) != -1){
				$( this ).css("background","greenyellow"); 
			  } 
			});			
		} else {
			console.log('off')
			$('#user-list>p').each(function( index ) {
			  console.log( 'each' );	
			  if (usersOnline.indexOf($( this ).text() ) != -1){
				$( this ).css("background","#d3d3eb");  
			  } 
			});
		}
	},5000);
});

socket.on('oldcolors', function (usersOnline){
	setTimeout(function(){
		console.log('off online>',usersOnline)
		$('#user-list>p').each(function( index ) {
		  console.log( 'each oldcolors',(usersOnline.indexOf($( this ).text() ) == -1) );	
		  if (usersOnline.indexOf($( this ).text() ) == -1){
			$( this ).css("background","#d3d3eb");  
		  } 
		});
	},5000);
});

//-----------------------------------------------
/*
$(document).ready(function () {
	setTimeout(function(){
		if (navigator.onLine == true){
			console.log('on')
			//$('#user-list').css("background","greenyellow");
			var x = document.getElementsByClassName("userp").length;
			console.log( 'class',x);

			$('#user-list>p').each(function( index ) {
			  console.log( 'each' );	
			  console.log( index + ": " + $( this ).text() );
			  if ($( this ).text() == $('#response').text()){
				$( this ).css("background","greenyellow"); 
			  } 
			});			
		} else {
			console.log('off')
			$('#user-list>p').each(function( index ) {
			  console.log( 'each' );	
			  console.log( index + ": " + $( this ).text() );
			  if ($( this ).text() == $('#response').text()){
				$( this ).css("background","#d3d3eb");  
			  } 
			});
		}
	},5000);
})

*/
