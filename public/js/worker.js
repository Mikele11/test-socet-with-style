var url = "https://socetchat.herokuapp.com";//https://socetchat.herokuapp.com 
var socket = io.connect(url);
var user_name = "";
var current_room = "";

var rooms=[];

function unique(arr) {
	var obj = {};
	for (var i = 0; i < arr.length; i++) {
		var str = arr[i];
		obj[str] = true; 
	}			
	return Object.keys(obj); 
};

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
		$('#room-list').empty();
		rooms.forEach((v) => {
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

var avatar;
if ($('#picrscr').val()==''){
	avatar='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXPg-87YPJhgdeqQoAlUdgF60k6yi61LlpDtSXSqjWMVa9xbWVXQ';
}else{
	avatar=$('#picrscr').val();
}

$('#post-message').on('submit', () => {
	socket.emit('chat message', {
		room_id: current_room,
		user_avatar: avatar,		
		user_name: user_name,
		message: $('#input-message').val()
	});
	$('#input-message').val("");
	return false;
})

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
			$('#room-list').empty();
			rooms.forEach((v) => {
				$('#room-list').append('<a href="#" class="list-group-item room-menu" data-room-id="' + v + '">' + v + '</a>');
			}) 			 
		}
	});
							
	socket.emit('fetch message', current_room);
	$('#current_room_id').text(current_room);
	return false;
});

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
				//$('<p class="userp">' +'<img class="useravatar" src="'+ data_doc.log.user_avatar+'">'+ data_doc.log.user_name + '：' + data_doc.log.message + '&nbsp;&nbsp;&nbsp;<i class="fa fa-trash"><span class="idhiden">'+data_doc._id+'</span></i>'+'</p>').appendTo('#message-list');
		
			});
		}
	});							
	return false;
});

//--------------------------видалення кінець
socket.on('fetch rooms', (rooms) => {
	$('#room-list').empty();
	rooms.forEach((v) => {
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
		//$('<p class="userp">' +'<img class="useravatar" src="'+ data_doc.log.user_avatar+'">'+ data_doc.log.user_name + '：' + data_doc.log.message + '&nbsp;&nbsp;&nbsp;<i class="fa fa-trash"><span class="idhiden">'+data_doc._id+'</span></i>'+'</p>').appendTo('#message-list');
		
	}

});
socket.on('chat message init', (messages) => {
	$('#message-list').empty();
	messages.forEach((v) => {
		$('#message-list').append('<p>' +'<img class="useravatar" src="'+ v.log.user_avatar+'">'+ v.log.user_name + '：' + v.log.message + '&nbsp;&nbsp;&nbsp;<i class="fa fa-trash"><span class="idhiden">'+v._id+'</span></i>'+'</p>');
		//$('<p class="userp">' +'<img class="useravatar" src="'+ data_doc.log.user_avatar+'">'+ data_doc.log.user_name + '：' + data_doc.log.message + '&nbsp;&nbsp;&nbsp;<i class="fa fa-trash"><span class="idhiden">'+data_doc._id+'</span></i>'+'</p>').appendTo('#message-list');
		
	});
});

$(window).load(function() {
	setTimeout(function(){
		if (navigator.onLine == true){
			console.log('on')
			//$('#user-list').css("background","greenyellow");
			 console.log( 'each1',$('#user-list>p') );
			console.log( 'each2',$('.userp') );
			$('#user-list>p').each(function( index ) {
			  console.log( 'each' );	
			  console.log( index + ": " + $( this ).text() );
			  if ($( this ).text() == $('#response').text()){
				$( this ).css("background","greenyellow");  
			  } 
			});
			
		} else {
			console.log('off')
			$('p').css("background","#d3d3eb");
		}
	},2000);
})

