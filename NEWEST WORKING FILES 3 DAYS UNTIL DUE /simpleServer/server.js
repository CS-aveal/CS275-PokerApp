var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

connections = [];
// =============

const Suit = {
    spade: 0,
    club: 1,
    diamond: 2,
    heart: 3
}

roundOne = false

const Rank = {
    highCard: 0,
    pair: 1,
    twoPair: 2,
    trips: 3,
    straight: 4,
    flush: 5,
    fullHouse: 6,
    quads: 7,
    straightFlush: 8
}

class Card{
    constructor(num,suit){
        this.number = num;
        this.suit = suit;
    }
    getID(){

        let letter = this.suit.toString().charAt(0);

        return this.number.toString()+letter.toUpperCase();

    }
}

var gameList = new Array();

//return 1 if first card is higher, 2 if second is higher, 0 if equal
function compareCard(first,second){
    if(first.number < second.number){
        return 2;
    } else if (first.number > second.number){
        return 1;
    } else {
        return 0;
    }
}

class Deck{
    constructor(){
        this.cardDeck = [];
        for(let i = 2; i <= 14; i++ ){
            for (let s in Suit){
                this.cardDeck.push(new Card(i,s))
            }
        }
    }
    resetDeck(){
        this.cardDeck = [];
        for(let i = 2; i <= 14; i++ ){
            for (let s in Suit){
                this.cardDeck.push(new Card(i,s))
            }
        }
    }
    shuffle(){
        this.cardDeck.sort((a, b) => 0.5 - Math.random());
    }
    popTop(){
        return this.cardDeck.pop();
    }
}

class PlayerHand{
    constructor(){
        this.hand = [];
        this.rank = Rank.highCard;
        //individual rank variables
        //highcard:
        this.fiveHighest = []
        //pair:
        this.firstPairRank = 0
        this.threeOthers = []
        //two pair:
        this.secondPairRank = 0
        this.twoPairKicker = 0
        //trips:
        this.tripsRank = 0
        this.twoKickers = []
        //straight:
        this.straightHigh = 0
        //flush:
        this.flushVals = []
        //full house:
        //set of 3 = tripsRank
        this.twoSet = 0
        //quads:
        this.quadsRank = 0
        this.quadsKicker = 0
        //straight flush:
        this.straightFlushHigh = 0
    }
    addCard(card){
        this.hand.push(card);
    }
    clear(){
        this.hand = [];
        this.rank = Rank.highCard;
        this.fiveHighest = []
        this.firstPairRank = 0
        this.threeOthers = []
        this.secondPairRank = 0
        this.twoPairKicker = 0
        this.tripsRank = 0
        this.twoKickers = []
        this.straightHigh = 0
        this.flushVals = []
        this.twoSet = 0
        this.quadsRank = 0
        this.quadsKicker = 0
        this.straightFlushHigh = 0
    }
    getRank(){
        //sort hand
        this.hand.sort(function(a,b){return a.number - b.number});
        //set rank = highCard with highest 5
        let handRev = [...this.hand];
        for (let c in handRev.reverse()){
            if(this.fiveHighest.length < 5){
                this.fiveHighest.push(handRev[c]);
            }
        }
        //get card counts, store in dictionary
        var countDict = {};
        for (let c in this.hand){
            let exists = this.hand[c].number in countDict;
            if (exists){
                countDict[this.hand[c].number] ++;
            }else{
                countDict[this.hand[c].number] = 1;
            }
        }
        //check pair
        for (let c in countDict){
            if (countDict[c] == 2){
                if (Number(c) > this.firstPairRank){
                    this.firstPairRank = c;
                    this.rank = Rank.pair;
                }
            }
        }
        if(this.rank == Rank.pair){
            for(let c in handRev){
                if(handRev[c].number != this.firstPairRank && this.threeOthers.length < 3 ){
                    this.threeOthers.push(handRev[c].number);
                }
            }
        }
        //check two pair
        for (let c in countDict){
            if (countDict[c] == 2){
                if (Number(c) > this.secondPairRank && Number(c) != this.firstPairRank){
                    this.secondPairRank = c;
                    this.rank = Rank.twoPair;
                }
            }
        }
        if(this.rank == Rank.twoPair){
            for(let c in handRev){
                if(handRev[c].number != this.firstPairRank && handRev[c].number != this.secondPairRank && this.twoPairKicker == 0 ){
                    this.twoPairKicker = handRev[c].number;
                }
            }
        }
        //check trips
        for (let c in countDict){
            if (countDict[c] == 3){
                if (Number(c) > this.tripsRank){
                    this.tripsRank = c;
                    this.rank = Rank.trips;
                }
            }
        }
        if(this.rank == Rank.trips){
            for(let c in handRev){
                if(handRev[c].number != this.tripsRank && this.twoKickers.length < 2 ){
                    this.twoKickers.push(handRev[c].number);
                }
            }
        }
        //check straight
        //first, make unique hand
        //Bug: May not recognize a straight flush if there are 2 cards of one of the numbers in the straight, because handUnique only stores 1 of the suits.
        let handUnique = []
        for (let c in this.hand){
            if (!handUnique.some(Card=>Card.number == this.hand[c].number)){
                handUnique.push(this.hand[c]);
            }
        }
        //check straight (and straight flush)
        let straightFlush = false
        if(handUnique.length >= 5){
            for(let i = 0; i <= handUnique.length - 5; i++){
                if((handUnique[i+1].number == handUnique[i].number + 1) && (handUnique[i+2].number == handUnique[i].number + 2) && (handUnique[i+3].number == handUnique[i].number + 3) && (handUnique[i+4].number == handUnique[i].number + 4)){
                    this.rank = Rank.straight;
                    this.straightHigh = handUnique[i+4].number;
                    //check for straight flush
                    if(handUnique[i].suit == handUnique[i+1].suit && handUnique[i].suit == handUnique[i+2].suit && handUnique[i].suit == handUnique[i+3].suit && handUnique[i].suit == handUnique[i+4].suit){
                        straightFlush = true;
                        this.straightFlushHigh = handUnique[i+4].number;
                    }
                }
            }
        }
        //check flush
        let spades = 0, clubs = 0, hearts = 0, diamonds = 0;
        let flushSuit;
        let flushBool = false
        for (let c in this.hand){
            switch(this.hand[c].suit){
                    case Suit.spade:
                        spades ++;
                        if (spades >= 5){
                            flushBool = true;
                            flushSuit = Suit.spade;
                        }
                        break;
                    case Suit.diamond:
                        diamonds ++;
                        if (diamonds >= 5){
                            flushBool = true;
                            flushSuit = Suit.diamond;
                        }
                        break;
                    case Suit.club:
                        clubs ++;
                        if (clubs >= 5){
                            flushBool = true;
                            flushSuit = Suit.club;
                        }
                        break;
                    case Suit.heart:
                        hearts ++;
                        if (hearts >= 5){
                            flushBool = true;
                            flushSuit = Suit.heart;
                        }
                        break;
            }
        }
        if (flushBool){
            this.rank = Rank.flush;
            for (let c in handRev){
                if (handRev[c].suit == flushSuit && this.flushVals.length < 5){
                    this.flushVals.push(handRev[c].number);
                }
            }
        }
        //check full house
        if (this.tripsRank > 0){
            for (let c in countDict){
                if (countDict[c] >= 2){
                    if (Number(c) > this.twoSet && Number(c) != this.tripsRank){
                        this.twoSet = c;
                        this.rank = Rank.fullHouse;
                    }
                }
            }
        }
        //check quads
        for (let c in countDict){
            if (countDict[c] == 4){
                this.rank = Rank.quads;
                for (let c in handRev){
                    if (handRev[c].number != this.quadsRank && this.quadsKicker == 0){
                        this.quadsKicker = handRev[c].number;
                    }
                }
            }
        }
        //check straight flush
        if (straightFlush){
            this.rank = Rank.straightFlush;
        }
    }
}

//compare 2 playerHands
//returns 1 if first is better, 2 if second is better, 0 if tie
//first = first playerHand, second = second playerHand
//INCOMPLETE: needs to check cases where rank is equal
//FOR NOW: determine winner with maximum playerHand.rank
function compareHands(first, second){
    if (first.rank > second.rank){
        return 1;
    } else if (first.rank < second.rank){
        return 2;
    } else if (first.rank == second.rank){
        let compare = 0;
        switch(first.rank){
                case Rank.highCard:
                for(c in first.fiveHighest){
                    compare = compareCard(first.fiveHighest[c],second.fiveHighest[c]);
                    if(compare > 0){
                        return compare;
                    }
                }
                return 0;
                case Rank.pair:
                if(first.firstPairRank > second.firstPairRank){
                    return 1;
                } else if (second.firstPairRank > first.firstPairRank){
                    return 2;
                }
                for(c in first.threeOthers){
                    compare = compareCard(first.threeOthers[c],second.threeOthers[c]);
                    if(compare > 0){
                        return compare;
                    }
                }
                return 0;
                case Rank.twoPair:
                if(first.firstPairRank > second.firstPairRank){
                    return 1;
                } else if (second.firstPairRank > first.firstPairRank){
                    return 2;
                } else if(first.secondPairRank > second.secondPairRank){
                    return 1;
                } else if (second.secondPairRank > first.secondPairRank){
                    return 2;
                } else {
                    return compareCard(first.twoPairKicker, second.twoPairKicker);
                }
                case Rank.trips:
                if(first.tripsRank > second.tripsRank){
                    return 1;
                } else if (second.tripsRank > first.tripsRank){
                    return 2;
                }
                for(c in first.twoKickers){
                    compare = compareCard(first.twoKickers[c],second.twoKickers[c]);
                    if(compare > 0){
                        return compare;
                    }
                }
                return 0;
                case Rank.straight:
                if(first.straightHigh > second.straightHigh){
                    return 1;
                } else if(second.straightHigh > first.straightHigh){
                    return 2;
                } else{
                    return 0;
                }
                case Rank.flush:
                for(c in first.flushVals){
                    compare = compareCard(first.flushVals[c],second.flushVals[c]);
                    if(compare > 0){
                        return compare;
                    }
                }
                return 0;
                case Rank.fullHouse:
                if(first.tripsRank > second.tripsRank){
                    return 1;
                } else if (second.tripsRank > first.tripsRank){
                    return 2;
                }
                if(first.twoSet > second.twoSet){
                    return 1;
                } else if (second.twoSet > first.twoSet){
                    return 2;
                }
                return 0;
                case Rank.quads:
                if(first.quadsRank > second.quadsRank){
                    return 1;
                } else if (second.quadsRank > first.quadsRank){
                    return 2;
                }
                if(first.quadsKicker > quadsKicker){
                    return 1;
                } else if (second.quadsKicker > first.quadsKicker){
                    return 2;
                }
                return 0;
                case Rank.straightFlush:
                if(first.straightFlushHigh > second.straightFlushHigh){
                    return 1;
                } else if(second.straightFlushHigh > first.straightFlushHigh){
                    return 2;
                } else{
                    return 0;
                }
        }
    }
}

const State = {
    preflop: 0,
    flop: 1,
    turn: 2,
    river: 3,
    over: 4
}
const DealerAction = {
    dealPlayers: 0,
    dealFlop: 1,
    dealTurn: 2,
    dealRiver: 3,
    endRound: 4,
    resetRound: 5
}
const Options = {
    noCheck: 0,
    noCall: 1,
    //allInNoOptions?
}
const Choice = {
    fold: 0,
    check: 1,
    call: 2,
    raise: 3
}

class Player{
    constructor(name,stack, socketID){
        this.socketID = socketID;
        this.name = name;
        this.stack = stack;
        this.privateHand = [];
        this.hand = new PlayerHand();
        this.totalBet = 0;
        this.dealer = false;
        this.folded = false;
    }
    dealPrivateHand(deck){
        this.privateHand = [];
        this.privateHand.push(deck.popTop());
        this.privateHand.push(deck.popTop());
    }
    setDealer(){
        this.dealer = true;
    }
}

class Round{
    constructor(ID, stakes, defaultStack){
        this.defaultStack = defaultStack;
        this.ID = ID;
        this.stakes = stakes;
        this.state;
        this.deck = new Deck();
        this.deck.shuffle();
        this.allPlayers = [];
        this.playersIn = [];
        this.commonCards = [];
        this.potSize = 0;
        this.highestBet = 0;
        this.dealerIndex = 0;
        this.currentPlayerIndex = 1;
        this.dealerPlayed = false;
        this.lastPlayerIndex = 0;
    }
    addPlayer(player){
        this.allPlayers.push(player);
        this.playersIn.push(player);
    }
    resetRound(){
        this.state = State.preflop;
        this.playersIn = []
        this.potSize = 0;
        this.highestBet = 0;
        this.dealerPlayed = false;
        this.deck = new Deck();
        this.deck.shuffle();
        this.commonCards = [];
        this.dealerIndex = getNextIndex(this.allPlayers, this.dealerIndex);
        this.lastPlayerIndex = this.dealerIndex;
        this.currentPlayerIndex = getNextIndex(this.playersIn, this.dealerIndex);
        for(i in this.allPlayers){
            this.playersIn.push[this.allPlayers[i]]
            this.allPlayers[i].totalBet = 0;
            this.allPlayers[i].dealer = false;
            this.allPlayers[i].privateHand = [];
            this.allPlayers[i].hand.clear();
            this.allPlayers[i].folded = false;
            
        }
        this.allPlayers[this.dealerIndex].dealer = true;
    }
}



/* maybe create a struct for each connection to be able to specify the ID of each socket to be able to reference each user*/

gameCodeCounter = 1
gameIdCounter = 0

maxPlayerCount = 4

let r;

gameList = [];

//need this to just be an attribute of game because there could be multiple games going on
gameRunning = false

// =============
server.listen(process.env.PORT || 3000);
console.log('Server is running...');

io.sockets.on('connection', function(socket) {
  console.log('Client connected');
  connections.push(socket);
  console.log(connections);
  console.log(socket);
  
    
  socket.on('Heroku Server Testing', function(data) {
//    console.log(data);
//    console.log("Here at Heroku Server Testing");
  });
    
  socket.on('disconnect', function(data){
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnect: %s sockets are connected', connections.length);
  });
    
        socket.on('Create Game', function(data) {
            
            //onlything needed in start game is the call to the function start game
//            console.log(data);
//            console.log("AT CREATE GAME");
//            console.log(data[2]);
            let stakeInt = 0;
            let defaultStack = 0;
            switch(data[2]){
                    case "Low":
                    stakeInt = 0;
                    defaultStack = 200;
                    break;
                    case "Medium":
                    stakeInt = 1;
                    defaultStack = 400;
                    break;
                    case "High":
                    stakeInt = 2;
                    defaultStack = 1000;
                    break;
            }
            
            
            round1 = new Round(data[0],stakeInt, defaultStack);
            round1.addPlayer(new Player(data[1], defaultStack, socket.id));
            gameList.push(round1);
            r = gameList[gameList.length - 1];
//            console.log("HERE");
//            console.log(round1);
            sendBackCreateSuccessful(socket.id, round1);
            
        });
        socket.on('Join Game', function(data) {
            
            //onlything needed in start game is the call to the function start game
            
            //round1 = new Round(100,100);
            //gameList.push(round1);
            
            
            for (let i = 0; i < gameList.length; i++){
                if (gameList[i].ID == data[0]){
                    for (let l = 0; l < gameList[i].playersIn.length; l++){
                        if (gameList[i].playersIn[l].name ==  data[1]){
                            //if the name is already in the game then send back an event saying the name is already in game
                            sendBackJoinGameUnsuccessful(socket.id, data[0]);
                        }
                    }
                }
            }
            
            
            
            
            for (let i = 0; i < gameList.length; i++){
                if (gameList[i].ID == data[0]){
                    //add player into the game
                    gameList[i].addPlayer(new Player(data[1], r.defaultStack, socket.id));
//                    console.log(gameList[i]);
                }
            }
            
            //join game was successful
            //console.log(round1);
            //sendBackJoinSuccessful(socket.id, round1);
            
        });
        
        
        
        
        socket.on('Start Game', function(data) {
            //this will now need to log the players turn and say it is the next persons turn
            //do this by



            //need to pass in the round which will be created once create game was called so instance is already created
            //need to send to all of the clients all of the players names
            //start game is going to send all of the information to be displayed on the client side
            var gameInfo = {};

//            console.log(r.allPlayers[0].privateHand[0]);


            if (r.allPlayers.length == 1){
                gameInfo["Player1"] = r.allPlayers[0].name;
                
                gameInfo["Player1 Stack"] = r.allPlayers[0].stack.toString();
                //will need to send the cards of each player and the pot over
                


            }
            else if (r.allPlayers.length == 2){
                gameInfo["Player1"] = r.allPlayers[0].name;
                gameInfo["Player1 Stack"] = r.allPlayers[0].stack.toString();


                gameInfo["Player2"] = r.allPlayers[1].name;
                gameInfo["Player2 Stack"] = r.allPlayers[1].stack.toString();

                
            }
            else if (r.allPlayers.length == 3){
                gameInfo["Player1"] = r.allPlayers[0].name;
                gameInfo["Player1 Stack"] = r.allPlayers[0].stack.toString();



                gameInfo["Player2"] = r.allPlayers[1].name;
                gameInfo["Player2 Stack"] = r.allPlayers[1].stack.toString();


                gameInfo["Player3"] = r.allPlayers[2].name;
                gameInfo["Player3 Stack"] = r.allPlayers[2].stack.toString();


            }
            else if (r.allPlayers.length == 4){
                gameInfo["Player1"] = r.allPlayers[0].name;
                gameInfo["Player1 Stack"] = r.allPlayers[0].stack.toString();


                gameInfo["Player2"] = r.allPlayers[1].name;
                gameInfo["Player2 Stack"] = r.allPlayers[1].stack.toString();


                gameInfo["Player3"] = r.allPlayers[2].name;
                gameInfo["Player3 Stack"] = r.allPlayers[2].stack.toString();



                gameInfo["Player4"] = r.allPlayers[3].name;
                gameInfo["Player4 Stack"] = r.allPlayers[3].stack.toString();


            }

//            console.log(gameInfo);

            io.sockets.emit('Start Game', gameInfo);
            
            
            startGame();

        });
        
        socket.on('Send Bet', function(data) {
            //this will now need to log the players turn and say it is the next persons turn
            //do this by
            for (let i = 0; i < r.allPlayers.length; i ++){
                if (r.allPlayers[i].socketID == socket.id){
                    //var choice = new Choice()
                    determineAction(Choice.raise, i, data[1]);
                }
            }
            //need to pass in the round which will be created once create game was called so instance is already created
//            console.log(data[1]);
            
        });
        
        socket.on('Send Call', function(data) {
            //this will now need to log the players turn and say it is the next persons turn
            //do this by
            for (let i = 0; i < r.allPlayers.length; i ++){
                if (r.allPlayers[i].socketID == socket.id){
                    //var choice = new Choice()
                    //have to figure out what the last call was so that I am able to call the determineAction I need Heshi to let me know what he wants
                    //possiby a global variable prevAct_ or something just to keep track in case they call
                    determineAction(Choice.call, i, 0);
                }
            }
            
            
        });
        
        socket.on('Send Fold', function(data) {
            //this will now need to log the players turn and say it is the next persons turn
            //do this by
            for (let i = 0; i < r.allPlayers.length; i ++){
                //this is weird and not sure if I should keep it
                //FIXFIXFIXFIXFIXFIXFIXFIXFIFXIFXIFXFIXFIXFIXFIXFIXFIXFIX
                if (r.allPlayers[i].socketID == socket.id){
                    //var choice = new Choice()
                    //have to figure out what the last call was so that I am able to call the determineAction I need Heshi to let me know what he wants
                    //possiby a global variable prevAct_ or something just to keep track in case they call
                    //not sure how heshi wants to handle this but I will ask
                    determineAction(Choice.fold, i, 0);
                }
            }
            
            
        });
        
    socket.on('Send Check', function(data) {
        //this will now need to log the players turn by sending the info to determineAction
        //do this by
        for (let i = 0; i < r.allPlayers.length; i ++){
            //this is weird and not sure if I should keep it
            //FIXFIXFIXFIXFIXFIXFIXFIXFIFXIFXIFXFIXFIXFIXFIXFIXFIXFIX
            if (r.allPlayers[i].socketID == socket.id){
                //var choice = new Choice()
                //have to figure out what the last call was so that I am able to call the determineAction I need Heshi to let me know what he wants
                //possiby a global variable prevAct_ or something just to keep track in case they call
                //not sure how heshi wants to handle this but I will ask
                determineAction(Choice.check, i, 0);
            }
        }
    });
});

// ==============

//r = round
//act = required action (DealerAction enum)
function doDealerAction(act){
    r.highestBet = 0;
    for(i in r.allPlayers){
        r.allPlayers[i].totalBet = 0;
    }
    switch(act){
            case DealerAction.dealPlayers:
            for(let c in r.allPlayers){
                console.log("dealing hand for %s", r.allPlayers[c].name);
                if(r.allPlayers[c].dealer == true){
                    console.log("<Dealer>")
                }
                r.allPlayers[c].dealPrivateHand(r.deck);
                console.log(r.allPlayers[c].privateHand);
                r.lastPlayerIndex = getNextIndex(r.allPlayers, r.dealerIndex);
                r.lastPlayerIndex = getNextIndex(r.allPlayers, r.lastPlayerIndex);
                
            }
            
            
            
            gameInfo = {};
            if (r.allPlayers.length == 1){
                //emit to each player their specific index so you are able to set the cards to the specific person
                playerIndex = {};
                playerIndex["Player Index"] = 1;
                io.to(r.allPlayers[0].socketID).emit("Player Index", playerIndex);
                
                
                gameInfo["Player"] = r.allPlayers[0].name;
                //will need to send the cards of each player and the pot over
                gameInfo["Player1 Card1"] = r.allPlayers[0].privateHand[0].getID()
                gameInfo["Player1 Card2"] = r.allPlayers[0].privateHand[1].getID()
                
                
            
            
            }
            else if (r.allPlayers.length == 2){
                
//                console.log("Emitting Players index and card info")
                
                playerIndex = {};
                playerIndex["Player Index"] = 1;
//                console.log(playerIndex);
                io.to(r.allPlayers[0].socketID).emit("Player Index", playerIndex);
                playerIndex["Player Index"] = 2;
//                console.log(playerIndex);
                
                gameInfo["Player1 Card1"] = r.allPlayers[0].privateHand[0].getID();
                gameInfo["Player1 Card2"] = r.allPlayers[0].privateHand[1].getID();
            
                
            
                gameInfo["Player2 Card1"] = r.allPlayers[1].privateHand[0].getID();
                gameInfo["Player2 Card2"] = r.allPlayers[1].privateHand[1].getID();
            }
            else if (r.allPlayers.length == 3){
                
                playerIndex = {};
                playerIndex["Player Index"] = 1;
                io.to(r.allPlayers[0].socketID).emit("Player Index", playerIndex);
                playerIndex["Player Index"] = 2;
                io.to(r.allPlayers[1].socketID).emit("Player Index", playerIndex);
                playerIndex["Player Index"] = 3;
                io.to(r.allPlayers[2].socketID).emit("Player Index", playerIndex);
            
                gameInfo["Player1 Card1"] = r.allPlayers[0].privateHand[0].getID();
                gameInfo["Player1 Card2"] = r.allPlayers[0].privateHand[1].getID();
            
                
            
                gameInfo["Player2 Card1"] = r.allPlayers[1].privateHand[0].getID();
                gameInfo["Player2 Card2"] = r.allPlayers[1].privateHand[1].getID();
            
                
            
                gameInfo["Player3 Card1"] = r.allPlayers[2].privateHand[0].getID();
                gameInfo["Player3 Card2"] = r.allPlayers[2].privateHand[1].getID();
            
            }
            else if (r.allPlayers.length == 4){
                
                playerIndex = {};
                playerIndex["Player Index"] = 1;
                io.to(r.allPlayers[0].socketID).emit("Player Index", playerIndex);
                playerIndex["Player Index"] = 2;
                io.to(r.allPlayers[1].socketID).emit("Player Index", playerIndex);
                playerIndex["Player Index"] = 3;
                io.to(r.allPlayers[2].socketID).emit("Player Index", playerIndex);
                playerIndex["Player Index"] = 4;
                io.to(r.allPlayers[3].socketID).emit("Player Index", playerIndex);
                
            
                gameInfo["Player1 Card1"] = r.allPlayers[0].privateHand[0].getID();
                gameInfo["Player1 Card2"] = r.allPlayers[0].privateHand[1].getID();
            
                
            
                gameInfo["Player2 Card1"] = r.allPlayers[1].privateHand[0].getID();
                gameInfo["Player2 Card2"] = r.allPlayers[1].privateHand[1].getID();
            
                
            
                gameInfo["Player3 Card1"] = r.allPlayers[2].privateHand[0].getID();
                gameInfo["Player3 Card2"] = r.allPlayers[2].privateHand[1].getID();
            
                
            
                gameInfo["Player4 Card1"] = r.allPlayers[3].privateHand[0].getID();
                gameInfo["Player4 Card2"] = r.allPlayers[3].privateHand[1].getID();
            
                    }
            io.sockets.emit("Display UserCard Info", gameInfo);
            break;
            case DealerAction.dealFlop:
            console.log("Dealing flop")
            r.commonCards.push(r.deck.popTop());
            r.commonCards.push(r.deck.popTop());
            r.commonCards.push(r.deck.popTop());
            gameInfo = {};
            gameInfo["Pot Card1"] = r.commonCards[0].getID();
            gameInfo["Pot Card2"] = r.commonCards[1].getID();
            gameInfo["Pot Card3"] = r.commonCards[2].getID();
            io.sockets.emit("Display PotCard Info", gameInfo);
            console.log("Common cards: ")
            console.log(r.commonCards);
            r.lastPlayerIndex = r.dealerIndex;
            break;
            case DealerAction.dealTurn:
            console.log("Dealing turn")
            r.commonCards.push(r.deck.popTop());
            console.log("Common cards: ")
            console.log(r.commonCards);
            gameInfo = {};
            gameInfo["Pot Card1"] = r.commonCards[0].getID();
            gameInfo["Pot Card2"] = r.commonCards[1].getID();
            gameInfo["Pot Card3"] = r.commonCards[2].getID();
            gameInfo["Pot Card4"] = r.commonCards[3].getID();
            io.sockets.emit("Display PotCard Info", gameInfo);
            break;
            case DealerAction.dealRiver:
            console.log("Dealing river")
            r.commonCards.push(r.deck.popTop());
            console.log("Common cards: ")
            console.log(r.commonCards);
            gameInfo = {};
            gameInfo["Pot Card1"] = r.commonCards[0].getID();
            gameInfo["Pot Card2"] = r.commonCards[1].getID();
            gameInfo["Pot Card3"] = r.commonCards[2].getID();
            gameInfo["Pot Card4"] = r.commonCards[3].getID();
            gameInfo["Pot Card5"] = r.commonCards[4].getID();
            io.sockets.emit("Display PotCard Info", gameInfo);
            break;
            case DealerAction.endRound:
            console.log("Round Over");
            let winnerIndex = 0;
            let winningHand = new PlayerHand();
            winningHand.rank = -1;
            //create PlayerHand and get rank
            for(i in r.playersIn){
                for(c in r.playersIn[i].privateHand){
                    r.playersIn[i].hand.addCard(r.playersIn[i].privateHand[c]);
                }
                for(c in r.commonCards){
                    r.playersIn[i].hand.addCard(r.commonCards[c]);
                }
                r.playersIn[i].hand.getRank();
                console.log("%s has rank %s", r.playersIn[i].name, r.playersIn[i].hand.rank)
                if (compareHands(r.playersIn[i].hand,winningHand) == 1){
                    winningHand = r.playersIn[i].hand;
                    winnerIndex = i;
                }
            }
            console.log("Winner is %s", r.playersIn[winnerIndex].name);
            console.log("paying winner %s", r.potSize)
            r.playersIn[winnerIndex].stack += r.potSize;
            let emitIndex;
            for(p in r.allPlayers){
                if(r.playersIn[winnerIndex].name == r.allPlayers[p].name){
                    emitIndex = p;
                }
            }
            settings = {};
            settings["Player Index"] = emitIndex;
            settings["Player Stack"] = r.allPlayers[emitIndex].stack
            //update player's stack in the UI
            io.to(r.allPlayers[emitIndex].socketID).emit("Update Player Stack", settings);
            //wait
            //await new Promise(r => setTimeout(r, 5000));
            console.log("resetting round");
            r.resetRound();
            //reset pot val in UI
            io.sockets.emit("Update Pot Val", r.potSize);
            io.sockets.emit("Reset Pot Cards", "");
            break;
    }
    //call determineAction, passing as an argument the action that just happened
    determineAction(act, -1, 0);
}

//inputChoices = Choices enum
//this function will be called by determineAction function. It will cue the appropriate handler depending on what choices are available, which will send the input request to the player
//The input that is recieved will not come back to this function. When it is recieved, determine action will be called with the recieved input as an argument.
//Because input doesn't come back to here, determineAction or doDealerAction will need to handle the events associated with playerInput choices, like removing a player when they fold, or updating pot and stack values when a bet is made.

//everything done needs to be outputted to the UI via a handler, so we'll need a handler for everything like removing the player after they fold, dealing cards,changing pots, and any other changes that need to be observed in the UI. For now, all those actions are done directly, but we'll need to add calls to the handlers so that the UI gets updated too.

function getPlayerInput(inputChoices, playerIndex, minRaiseAmt, maxRaiseAmt, callAmt){
    let raiseSet = false;
    if (maxRaiseAmt < minRaiseAmt){
        raiseSet = true;
        //use maxRaiseAmt as only raise option (no slider)
    }
    switch(inputChoices){
            case Options.noCheck:
            console.log("player cannot check")
            //check if player is covered
            if(r.allPlayers[playerIndex].stack <= callAmt){
                //Only fold and call options available
                dic = {};
                dic["Call Amount"] = callAmt;
                
                io.to(r.allPlayers[playerIndex].socketID).emit("Fold Call Turn", dic);
                console.log("player is covered")
            } else {
                //else, fold, call, and raise options available.
                
                console.log("player is not covered")
                if(raiseSet){
                    //if a player wants to raise, he must raise whole stack because min raise > stack
                    dic = {};
                    dic["Raise Amount"] = maxRaiseAmt;
                    dic["Call Amount"] = callAmt;
//                    console.log("First at Raise Set");
                    io.to(r.allPlayers[playerIndex].socketID).emit("Fold Call Raise Turn", dic);
                } else {
                    //raise button generates slider from minRaiseAmt to maxRaiseAmt
                    //send the no check option to the player index because it is their turn
                    //
                    
//                    console.log("Second at else Set");
                    dic = {};
                    dic["Min Raise Amount"] = minRaiseAmt;
                    dic["Max Raise Amount"] = maxRaiseAmt;
                    dic["Call Amount"] = callAmt;
                    io.to(r.allPlayers[playerIndex].socketID).emit("No Check Turn", dic);
//                    console.log(playerIndex);
                    
//                    console.log("Last");
                }
            }
            
            break;
            case Options.noCall:
            console.log("player cannot call")
            io.to(r.allPlayers[playerIndex].socketID).emit("No Call Turn", "");
            break;
    }
    
    //r.allPlayers[playerIndex].
//    let input2 = 0;
//    console.log("Input for player with index %i: %s", playerIndex, r.allPlayers[playerIndex].name);
//    let input1 = prompt("enter action: ");
//    if (input1 == "raise"){
//        input2 = prompt("enter raise amount: ");
//    }
//    let pick;
    
    //determineAction(pick, playerIndex, Number(input2)); //this call will happen from input function
}


//helper functions
function getNextIndex(arr, i){
    let ind = increment(arr,i)
    while(r.allPlayers[ind].folded == true){
        ind = r.currentPlayerIndex = increment(arr,ind)
    }
    return ind;
}
function increment(arr,i){
    if(i >= arr.length -1){
        return 0;
    } else{
        return i + 1
    }
}
function getPrevIndex(arr, i){
    let ind = decrement(arr,i)
    while(r.allPlayers[ind].folded == true){
        ind = r.currentPlayerIndex = decrement(arr,ind)
    }
    return ind;
}
function decrement(arr,i){
    if(i == 0){
        return arr.length -1;
    } else{
        return i - 1
    }
}

//prevAct = Choice enum or dealerAction enum. Tells what action just occured.
//player = player index of player that just acted. -1 if dealer.
//val = bet/call value associated with player action.
function determineAction(prevAct, player, val){
//    if (player == 0){
//        player = r.currentPlayerIndex;
//    }
    if(player >= 0){ //the last action was a player action
        //First, make update according to action taken
        if(prevAct == Choice.fold){
            console.log("%s folded", r.allPlayers[player].name);
            r.allPlayers[player].folded = true;
            let remInd = r.playersIn.indexOf(r.allPlayers[player]);
            r.playersIn.splice(remInd,1);
//            console.log(player);
            io.sockets.emit("Player Folded", player);
        } else if(prevAct == Choice.check){
            console.log("%s checked", r.allPlayers[player].name);
            //do nothing?
        }else if(prevAct == Choice.call){
//            console.log("first potsize = %i", r.potSize);

            console.log("%s called", r.allPlayers[player].name);
            let callAmt = r.highestBet - r.allPlayers[player].totalBet
            r.allPlayers[player].totalBet += callAmt;
            r.allPlayers[player].stack -= callAmt;
            r.potSize += callAmt;
//            console.log("potsize = %i", r.potSize);
//            console.log("stack size = %i", r.allPlayers[i].stack);

            io.sockets.emit("Update Pot Val", r.potSize);
        }else if(prevAct == Choice.raise){
            console.log("%s raised by %s", r.allPlayers[player].name, val);
            r.highestBet += val; //make sure val = raise amount, not total bet for this to be right
            r.allPlayers[player].stack -= r.highestBet;
            r.allPlayers[player].totalBet += r.highestBet;
            r.potSize += r.highestBet;
            io.sockets.emit("Update Pot Val", r.potSize);
        }
        if(player == r.lastPlayerIndex){
            r.dealerPlayed = true;
            console.log("Last player %s played", r.allPlayers[player].name)
        }
        if(prevAct == Choice.fold){
            if(player == r.lastPlayerIndex){
//                console.log("decremented last player index")
                r.lastPlayerIndex = decrement(r.allPlayers, r.lastPlayerIndex);
            }
        }
        
//        console.log("potsize: %s", r.potSize);
        io.sockets.emit("Update Pot Val", r.potSize);
//        console.log("%s's stack size: %s",r.allPlayers[player].name, r.allPlayers[player].stack);
//        console.log("allPlayers:")
//        console.log(r.allPlayers);
//        console.log("playersIn")
//        console.log(r.playersIn);
        settings = {};
        settings["Player Index"] = player;
        settings["Player Stack"] = r.allPlayers[player].stack
        io.to(r.allPlayers[player].socketID).emit("Update Player Stack", settings);
        settings["Total Bet"] = r.allPlayers[player].totalBet;
        io.sockets.emit("Update Total Player Bet", settings);
//        console.log(" =============PLAYER TOTAL BET: %s", r.allPlayers[player].totalBet);
        
        
//        console.log("EVALUATING HERE 1============");
//        console.log("DEALER PLAYED: %s", r.dealerPlayed)
//        console.log("HIGHEST BET: %s", r.highestBet)
        for (p in r.playersIn){
//            console.log("INDEX: %s PLAYER TOTAL BET: %s", p, r.playersIn[p].totalBet)
        }
//        console.log("EVALUATING HERE 2 ============");
        //Next, determine next action
        if(r.playersIn.length == 1){ //if only 1 player left
            //round over via fold
            r.state = State.over;
            doDealerAction(DealerAction.endRound);
            
            

        } else if (r.dealerPlayed && r.playersIn.every(player => player.totalBet == r.highestBet)){
//            console.log("GOT PAST IT TO HERE!!!!! ============");
            //if dealer has played and each player has called highest bet
            //end betting round, proceed to deal next card or complete round
            r.dealerPlayed = false;
            let act;
            switch(r.state){
                    case State.preflop:
                    r.state = State.flop;
                    act = DealerAction.dealFlop;
                    break;
                    case State.flop:
                    r.state = State.turn;
                    act = DealerAction.dealTurn;
                    break;
                    case State.turn:
                    r.state = State.river;
                    act = DealerAction.dealRiver;
                    break;
                    case State.river:
                    r.state = State.over;
                    act = DealerAction.endRound;
                    break;
            }
            doDealerAction(act);
            
        } else{
            //continue betting round
            //UPDATE INDEXES
            r.currentPlayerIndex = getNextIndex(r.allPlayers,r.currentPlayerIndex)
            //set options
            let opt;
            if(r.allPlayers[r.currentPlayerIndex].totalBet == r.highestBet){
                opt = Options.noCall;
            } else if(r.allPlayers[r.currentPlayerIndex].totalBet < r.highestBet){
                opt = Options.noCheck;
            }
            //GET RID OF LAST ARGUMENT, USE r.currentPlayerIndex INSIDE GETINPUT FUNCTION
            getPlayerInput(opt, r.currentPlayerIndex, r.highestBet, r.allPlayers[r.currentPlayerIndex].stack - (r.highestBet-r.allPlayers[r.currentPlayerIndex].totalBet),r.highestBet - r.allPlayers[r.currentPlayerIndex].totalBet );
        }
    }
    else if(player == -1){//dealer action just happened
        if(prevAct == DealerAction.dealPlayers){
            let smallBlind;
            switch(r.stakes){
                    case 0:
                    smallBlind = 5;
                    break;
                    case 1:
                    smallBlind = 10;
                    break;
                    case 2:
                    smallBlind = 25;
                    break;
            }
            r.currentPlayerIndex = getNextIndex(r.allPlayers, r.dealerIndex);
            
            r.allPlayers[r.currentPlayerIndex].stack -= smallBlind;
            r.allPlayers[r.currentPlayerIndex].totalBet += smallBlind;
            r.potSize += smallBlind;
            
//            console.log("Before update player total bet");
            
            settings = {};
            settings["Player Index"] = r.currentPlayerIndex;
            settings["Player Stack"] = r.allPlayers[r.currentPlayerIndex].stack
            io.sockets.emit("Update Player Stack", settings);
//            console.log(r.currentPlayerIndex);
//            console.log(r.allPlayers[r.currentPlayerIndex].totalBet);
            settings["Total Bet"] = r.allPlayers[r.currentPlayerIndex].totalBet;
//            console.log(settings["Total Bet"]);
            io.sockets.emit("Update Total Player Bet", settings);
            
//            console.log("After update player total bet");
            r.currentPlayerIndex = getNextIndex(r.allPlayers, r.currentPlayerIndex);
            
            r.allPlayers[r.currentPlayerIndex].stack -= smallBlind*2;
            r.allPlayers[r.currentPlayerIndex].totalBet += smallBlind*2;
            r.potSize += smallBlind*2;
        
            r.highestBet += smallBlind*2;
            
            settings = {};
            settings["Player Index"] = r.currentPlayerIndex;
            settings["Player Stack"] = r.allPlayers[r.currentPlayerIndex].stack
            io.sockets.emit("Update Player Stack", settings);
//            console.log(r.currentPlayerIndex);
//            console.log(r.allPlayers[r.currentPlayerIndex].totalBet);
            settings["Total Bet"] = r.allPlayers[r.currentPlayerIndex].totalBet;
//            console.log(settings["Total Bet"]);
            io.sockets.emit("Update Total Player Bet", settings);
            
            io.sockets.emit("Update Pot Val", r.potSize);

            
            r.currentPlayerIndex = getNextIndex(r.allPlayers, r.currentPlayerIndex);
            getPlayerInput(Options.noCheck, r.currentPlayerIndex, r.highestBet, r.allPlayers[r.currentPlayerIndex].stack - (r.highestBet-r.allPlayers[r.currentPlayerIndex].totalBet), r.highestBet - r.allPlayers[r.currentPlayerIndex].totalBet);

        }
        else if(prevAct == DealerAction.dealFlop || prevAct == DealerAction.dealTurn || prevAct == DealerAction.dealRiver){
            //time for another betting round.
            r.currentPlayerIndex = getNextIndex(r.allPlayers, r.dealerIndex);
            //call input function with players options
            getPlayerInput(Options.noCall, r.currentPlayerIndex, r.highestBet, r.allPlayers[r.currentPlayerIndex].stack - (r.highestBet-r.allPlayers[r.currentPlayerIndex].totalBet), r.highestBet - r.allPlayers[r.currentPlayerIndex].totalBet);
        }
        else if(prevAct == DealerAction.endRound){
            console.log("Starting another round")
            doDealerAction(DealerAction.dealPlayers)
        }
    }
}



function playerTurn(player) {
  return p1 * p2;
}

function startGame(){
    console.log("Starting Game")
    r.state = State.preflop;
    r.playersIn[0].setDealer();
    doDealerAction(DealerAction.dealPlayers);
}

function getPlayerInputSwift(socketID) {
    io.to(socketID).emit("Player Turn", {msg: "Your turn"});
}

function sendBackJoinSuccessful(socketID, round){
    io.to(socketID).emit("Join Successful", round.id);
}

function sendBackJoinGameUnsuccessful(socketID, round){
    io.to(socketID).emit("Join Unsuccessful", round.id);
}

function sendBackCreateSuccessful(socketID, round){
    io.to(socketID).emit("Create Success", round.id);
}

function sendTest(){
    io.sockets.emit("Test Success", "");
}

// ==============


setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
