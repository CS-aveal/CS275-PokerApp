var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

connections = [];

/*
 might want to create the object variable with
 */


/* maybe create a struct for each connection to be able to specify the ID of each socket to be able to reference each user*/

gameCodeCounter = 1
gameIdCounter = 0

gameList = [];

function Game(newId, users) {
  gameId = newId;
  gameUsers = users;
}

server.listen(process.env.PORT || 3000);
console.log('Server is running...');

io.sockets.on('connection', function(socket) {
    connections.push(socket);
    console.log('Connect: %s sockets are connected', connections.length);

    //Disconnect
    socket.on('disconnect', function(data){
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnect: %s sockets are connected', connections.length);
    });
    
    socket.on('NodeJS Server Port', function(data) {
        console.log(data);
        io.sockets.emit('iOS Client Port', {msg: 'Hi iOS Client!'}, {msg1: ['Hello', 'World']});
    });
    
    socket.on('Create Game', function(data) {
        console.log(data);
        
        users = [];
        users.push(socket.id);
        
        
        newGame1 = {
            code: gameCodeCounter,
            gameId: gameIdCounter,
            userList: users
        }
        
        gameList.push(newGame1);
        gameIdCounter += 1;
        gameCodeCounter += 1;
        
        console.log(newGame1.code);
        console.log(newGame1.gameId);
        console.log(newGame1.userList);
        
        io.sockets.emit('Display Game', {msg: ['Hello', 'World']});
    });
});
