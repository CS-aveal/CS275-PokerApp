var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

connections = [];

/*
 might want to create the object variable with
 */

class GameIteration{
    id;
    code;
    users;
    round;
    gameRunning;
    potSize;
    constructor(id, code, users, gameRunning){
        //users is going to be an array of class players
        this.id = id;
        this.code = code;
        this.userList = users;
        this.userTurn = users[0];
        this.round = 0;
        this.gameRunning = gameRunning;
    }
    
    incrementRound(){
        this.round = this.round + 1;
    }
    
    get playerTurn(){
        return this.userTurn;
    }
    
    get iD{
        return this.id;
    }
    
    get code{
        return this.code;
    }
    
    addPlayer(player){
        var validPlayer = true
        for (let i = 0; i < userList.length; i++){
            if (userList[i].SocketID == player.SocketID){
                validPlayer = false
            }
        }
        if (validPlayer){
            this.userList.push(player);
            return 1;
        }
        else{
            return 0;
        }
    }
    specifyPotSize(potSize){
        this.potSize = potSize;
    }
}

//create a struct for player
class Player {
    
    constructor(socketID, playerHand) {
        //player hand is going to be a struct/class that will give your hand
        this.socketID = socketID;
        this.playerHand = playerHand;
    }
    
    get PlayerRank{
        return this.playerHand.getRank;
    }
    
    get SocketID{
        return this.socketID;
    }
    
    
}

/* maybe create a struct for each connection to be able to specify the ID of each socket to be able to reference each user*/

gameCodeCounter = 1
gameIdCounter = 0

maxPlayerCount = 4

gameList = [];

//need this to just be an attribute of game because there could be multiple games going on
gameRunning = false


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
        //create a player struct for the person creating the game
        console.log(data);
        
        firstPlayerHand = new PLayerHand();
        
        arbitraryPlayer = new Player(socket.id, firstPlayerHand);
        
        users = [];
        users.push(arbitraryPlayer);
        
        
        gameList[gameList.length] = new GameIteration(gameIdCounter, gameCodeCounter, users, false);
        gameIdCounter += 1;
        gameCodeCounter += 1;
        
        console.log(gameList[0].id);
        console.log(gameList[0].code);
        console.log(gameList[0].userList);
        
        //io.sockets.emit('Display Game', {game: 'Poker'}, {buyin: '25'});
        var stringOutput = "User ";
        stringOutput += String(socket.id);
        stringOutput += " created the game with id ";
        stringOutput += String(gameIdCounter - 1);
        io.to(socket.id).emit("Created Game", {msg: stringOutput});
    });
    //cannot be a handle event start game is going to have to call a method
    socket.on('Start Game', function(data) {
        
        //onlything needed in start game is the call to the function start game
        
        startGame(data);
        
        /* this data needs to be inside the start game method*/
        //Determine who goes first by just letting the host go first
        //data is going to be the game code
        //just did less than because it is zero indexed
        
        for (let i = 0; i < gameList.length; i++){
            if (gameList[i].code == data){
                //Start the game functions
                gameRunning = true
                gameList[i].userTurn = gameList[i].users[0]
                while (gameRunning){
                    
                    //emit to the socket that needs to play its turn
                    playerTurn(gameList[i].userTurn)
                }
            }
            else{
                //game code was not in the list of games
            }
        }
        
        io.sockets.emit('Display Game', {game: 'Poker'}, {buyin: '25'});
    });
    
    socket.on('Created Game', function(data) {
        
        //onlything needed in start game is the call to the function start game
        
        startGame(data);
        for (let i = 0; i < data.length; i++){
            
        }
        
        /* this data needs to be inside the start game method*/
        //Determine who goes first by just letting the host go first
        //data is going to be the game code
        //just did less than because it is zero indexed
        
        for (let i = 0; i < gameList.length; i++){
            if (gameList[i].code == data){
                //Start the game functions
                gameRunning = true
                gameList[i].userTurn = gameList[i].users[0]
                while (gameRunning){
                    
                    //emit to the socket that needs to play its turn
                    playerTurn(gameList[i].userTurn)
                }
            }
            else{
                //game code was not in the list of games
            }
        }
        
        io.sockets.emit('Display Game', {game: 'Poker'}, {buyin: '25'});
    });
    
    socket.on('Player Turn Done', function(data) {
        //this will now need to log the players turn and say it is the next persons turn
        //do this by
        
        //need to get the
        
        console.log(data);
        
        if (data == "Fold"){
            if ()
        }
        else if (data == "Bet"){
            
        }
        else if (data == ""){
            
        }
        io.sockets.emit('iOS Client Port', {msg: 'Hi iOS Client!'}, {msg1: ['Hello', 'World']});
    });
    
    socket.on('Start Game', function(data) {
        //this will now need to log the players turn and say it is the next persons turn
        //do this by
        
        //need to pass in the round which will be created once create game was called so instance is already created
        
        startGame(r);
    });
    
    socket.on('Join Game', function(data) {
        //create a player struct for the person joining the game
        //will have to see if the player is already in the game before trying to add it as a player struct
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



//Need to test whether this will work properly or not with the automatic updating or not if not then I will need a function to start the game
//Event handler for sending the player's turn
//Function to handle that moves turns
//
function startGame(gameCode){
    for (let i = 0; i < gameList.length; i ++){
        if (gameList[i].code == gameCode) {
            //This is the game that we want to be starting
            gameList[i].gameRunning = true;
            while (gameList[i].gameRunning == true){
                //find players turn and so fourth
                if (gameList[i].round == 0){
                    //only want betting this round
                    //loop through the list of players and ask for their bet
                    for (let l = 0; l < gameList[i].userList.length; l++){
                        var roundString = "Round ";
                        roundString += String(gameList[i].round);
                        io.to(gameList[i].userList[l].SocketID).emit("Player Turn", {msg: roundString});
                    }
                    
                }
                else{
                    //want the wholething to happen
                    
                }
            }
        }
    }
}

function playerTurn(player) {
  return p1 * p2;
}

function getPlayerInput(socketID) {
    io.to(socketID).emit("Player Turn", {msg: "Your turn"});
}
