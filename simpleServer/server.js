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

maxPlayerCount = 4

gameList = [];


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
    
    socket.on('Join Game', function(data) {
        console.log(data);
        /*
         data will be the game code
         */
        var valid = true;
        
        for (let i = 0; i < gameList.length; i++) {
            if (gameList[i].code == data){
                if (gameList[i].userList.length == maxPlayerCount){
                    io.to(socket.id).emit("Join Game Invalid", {msg: "Too many players already in game"});
                    valid = false;
                }
                else if (gameList[i].userList.length > 0 && gameList[i].userList.length < maxPlayerCount){
                    for (let l = 0; l < gameList[i].userList.length; l++){
                        if (socket.id == gameList[i].userList[l]){
                            io.to(socket.id).emit("Join Game Invalid",{msg: "User already in game"});
                            valid = false;
                        }
                    }
                    if (valid == true){
                        gameList[i].userList.push(socket.id);
                        var specificId = String(socket.id);
                        console.log("About to emit New Player");
                        io.sockets.emit("New Player", {player: specificId});
                        io.to(specificId).emit("Join Game Successful", {msg: "Successfully joined game"});
                    }
                }
            }
        }
        
        console.log(gameList[0].userList);
        
        io.sockets.emit('Display Game', {msg: ['Hello', 'World']});
    });
});
