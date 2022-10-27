# CS275-PokerApp



SETUP
Server on silk
Each client is going to connect to server
Server will send information back and forth


Need to set up each game as an object in the server
Ie if the game is created all of the data should be housed inside the game code
Or could just have a list of game objects and loop over all to find the correct one
Array of structs

FOR CREATING THE GAME
Once in the create game screen the user who creates the game a game code is automatically generated
The user is able to put in create game settings
Game settings and code should be put into a struct
The game code and data is then sent to the server


FOR JOINING A GAME
Once in the join game screen the user will enter the game code which the server will then output the game settings

EXAMPLE POSSIBILITIES
The game starts and the users are able to send data to the server
Pass name and data to the server saying this is the player who did this and this is what they did

https://socket.io/blog/socket-io-on-ios/


CURRENT CAPABILITIES
Requirements
---------------------------------------------------------------------------------------------
First you need to download cocoapods through https://stackoverflow.com/questions/20755044/how-do-i-install-cocoapods link
Second you need to add a package manually by going to xcode and adding package with https://github.com/socketio/socket.io-client-swift URL
Next you need to install node.js

Setup
---------------------------------------------------------------------------------------------
Run server.js in simple server file to start the server file running on localhost:3000
Then run Xcode project

Features
---------------------------------------------------------------------------------------------
Server will connect to port 3000 as well as the client
They will complete a handshake to establish a connection,
after a connection is established the server will emit an event to a certain port which the iOS client will then handle.
The client will then send back to the server a create game event with settings of which the server will then recieve and handle and store the data on the server.
The server will add that game to the list of games and add the user who created the game to the user list.
The server will then send back data for display game of which the client will handle.
Then the client sends back a join game to test functionality,
however the server will recognize that user is already registered in the game and will return the socket id of that user and send back the event join game invalid.


