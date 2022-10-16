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
