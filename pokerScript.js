const prompt = require('prompt-sync')()

const Suit = {
    spade: 0,
    club: 1,
    diamond: 2,
    heart: 3
}
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
}

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
    constructor(name,stack){
        this.name = name;
        this.stack = stack;
        this.privateHand = [];
        this.hand = new PlayerHand();
        this.totalBet = 0;
        this.dealer = false;
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
    constructor(){
        this.state
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
    }
    addPlayer(player){
        this.allPlayers.push(player);
        this.playersIn.push(player);
    }
    resetRound(){
        this.state = State.preflop;
        this.playersIn = this.allPlayers;
        this.potSize = 0;
        this.highestBet = 0;
        this.dealerPlayed = false;
        this.deck = new Deck();
        this.deck.shuffle();
        this.commonCards = [];
        this.dealerIndex = getNextIndex(this.playersIn, this.dealerIndex);
        this.currentPlayerIndex = getNextIndex(this.playersIn, this.dealerIndex);
        for(i in this.playersIn){
            this.playersIn[i].totalBet = 0;
            this.playersIn[i].dealer = false;
            this.playersIn[i].privateHand = [];
            this.playersIn[i].hand.clear();
            
        }
        this.playersIn[this.dealerIndex].dealer = true;
    }
}

//r = round
//act = required action (DealerAction enum)
async function doDealerAction(r, act){
    r.highestBet = 0;
    for(i in r.playersIn){
        r.playersIn[i].totalBet = 0;
    }
    switch(act){
            case DealerAction.dealPlayers:
            r.deck.shuffle;
            r.playersIn = r.allPlayers;
            for(let c in r.playersIn){
                console.log("dealing hand for %s", r.playersIn[c].name);
                if(r.playersIn[c].dealer == true){
                    console.log("<Dealer>")
                }
                r.playersIn[c].dealPrivateHand(r.deck);
                console.log(r.playersIn[c].privateHand);
            }
            break;
            case DealerAction.dealFlop:
            console.log("Dealing flop")
            r.commonCards.push(r.deck.popTop());
            r.commonCards.push(r.deck.popTop());
            r.commonCards.push(r.deck.popTop());
            console.log("Common cards: ")
            console.log(r.commonCards);
            break;
            case DealerAction.dealTurn:
            console.log("Dealing turn")
            r.commonCards.push(r.deck.popTop());
            console.log("Common cards: ")
            console.log(r.commonCards);
            break;
            case DealerAction.dealRiver:
            console.log("Dealing river")
            r.commonCards.push(r.deck.popTop());
            console.log("Common cards: ")
            console.log(r.commonCards);
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
            //wait
            await new Promise(r => setTimeout(r, 5000));
            console.log("resetting round")
            r.resetRound();
            break;
    }
    //call determineAction, passing as an argument the action that just happened
    console.log("calling determineAction");
    determineAction(r, act, -1, 0);
}

//inputChoices = Choices enum
//this function will be called by determineAction function. It will cue the appropriate handler depending on what choices are available, which will send the input request to the player
//The input that is recieved will not come back to this function. When it is recieved, determine action will be called with the recieved input as an argument.
//Because input doesn't come back to here, determineAction or doDealerAction will need to handle the events associated with playerInput choices, like removing a player when they fold, or updating pot and stack values when a bet is made.

//everything done needs to be outputted to the UI via a handler, so we'll need a handler for everything like removing the player after they fold, dealing cards,changing pots, and any other changes that need to be observed in the UI. For now, all those actions are done directly, but we'll need to add calls to the handlers so that the UI gets updated too.

function getPlayerInput(r, inputChoices, playerIndex){
    switch(inputChoices){
            case Options.noCheck:
            console.log("player cannot check")
            break;
            case Options.noCall:
            console.log("player cannot call")
            break;
    }
    let input2 = 0;
    console.log("Input for player with index %i: %s", playerIndex, r.playersIn[playerIndex].name);
    let input1 = prompt("enter action: ");
    if (input1 == "raise"){
        input2 = prompt("enter raise amount: ");
    }
    let pick;
    switch(input1){
            case "fold":
            pick = Choice.fold;
            break;
            case "check":
            pick = Choice.check;
            break;
            case "call":
            pick = Choice.call;
            break;
            case "raise":
            pick = Choice.raise;
            break;
    }
    determineAction(r, pick, playerIndex, Number(input2));
}

//helper function
function getNextIndex(arr, i){
    if(i >= arr.length -1){
        return 0;
    } else{
        return i + 1
    }
}

//r = round
//prevAct = Choice enum or dealerAction enum. Tells what action just occured.
//player = player index of player that just acted. -1 if dealer.
//val = bet/call value associated with player action.
async function determineAction(r, prevAct, player, val){
    if(player >= 0){ //the last action was a player action
        //First, make update according to action taken
        if(prevAct == Choice.fold){
            console.log("%s folded", r.playersIn[player].name);
            //remove player from playersIn
            r.playersIn.splice(player,1);
        } else if(prevAct == Choice.check){
            console.log("%s checked", r.playersIn[player].name);
            //do nothing?
        }else if(prevAct == Choice.call){
            console.log("%s called", r.playersIn[player].name);
            let callAmt = r.highestBet - r.playersIn[player].totalBet
            r.playersIn[player].totalBet += callAmt;
            r.playersIn[player].stack -= callAmt;
            r.potSize += callAmt;
        }else if(prevAct == Choice.raise){
            console.log("%s raised by %s", r.playersIn[player].name, val);
            r.highestBet += val; //make sure val = raise amount, not total bet for this to be right
            r.playersIn[player].stack -= r.highestBet;
            r.playersIn[player].totalBet += r.highestBet;
            r.potSize += r.highestBet;
        }
        if(player == r.dealerIndex){
            r.dealerPlayed = true;
            console.log("Dealer (%s) played", r.playersIn[player].name)
        }
        console.log("potsize: %s", r.potSize)
        console.log("%s's stack size: %s",r.playersIn[player].name, r.playersIn[player].stack)
        //Next, determine next action
        if(r.playersIn.length == 1){ //if only 1 player left
            //round over via fold
            //pay winner
            r.playersIn[0].stack += r.potSize;
            //wait 5 seconds
            await new Promise(r => setTimeout(r, 5000));
            //reset round
            r.resetRound();
        } else if (r.dealerPlayed && r.playersIn.every(player => player.totalBet == r.highestBet)){
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
            console.log("Calling doDealerAction");
            doDealerAction(r, act);
            
        } else{
            //continue betting round
            if(prevAct == Choice.fold){
                if(r.currentPlayerIndex == r.playersIn.length){
                    r.currentPlayerIndex = 0;
                } //else, don't update index because removing player that folded does so automatically
            } else{
                r.currentPlayerIndex = getNextIndex(r.playersIn,r.currentPlayerIndex)
            }
            //set options
            let opt;
            if(r.playersIn[r.currentPlayerIndex].totalBet == r.highestBet){
                opt = Options.noCall;
            } else if(r.playersIn[r.currentPlayerIndex].totalBet < r.highestBet){
                opt = Options.noCheck;
            }
            getPlayerInput(r, opt, r.currentPlayerIndex);
        }
    }
    else if(player == -1){//dealer action just happened
        if(prevAct == DealerAction.dealPlayers || prevAct == DealerAction.dealFlop || prevAct == DealerAction.dealTurn || prevAct == DealerAction.dealRiver){
            //time for another betting round.
            r.currentPlayerIndex = getNextIndex(r.playersIn, r.dealerIndex);
            //call input function with players options
            getPlayerInput(r, Options.noCall, r.currentPlayerIndex);
        }
        else if(prevAct == DealerAction.endRound){
            console.log("Starting another round")
            doDealerAction(r, DealerAction.dealPlayers)
        }
    }
}




function startGame(r){
    console.log("Starting Game")
    r.state = State.preflop;
    r.playersIn[0].setDealer();
    doDealerAction(r, DealerAction.dealPlayers)
}
//To start
//create each player
let heshi = new Player("Heshi", 100)
let matt = new Player("Matt", 100)
let austin = new Player("Austin", 100)
let drew = new Player("Drew", 100)
//create round instance
let round1 = new Round();
//add each player to round
round1.addPlayer(heshi)
round1.addPlayer(matt)
round1.addPlayer(austin)
round1.addPlayer(drew)
//call startGame on round
startGame(round1);

