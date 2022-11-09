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
        for(let i = 1; i <= 14; i++ ){
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
        
        
    }
}


let playerHand = new PlayerHand()
playerHand.addCard(new Card(8,Suit.diamond))
playerHand.addCard(new Card(5,Suit.diamond))
playerHand.addCard(new Card(6,Suit.diamond))
playerHand.addCard(new Card(3,Suit.diamond))
//playerHand.addCard(new Card(10,Suit.diamond))
//playerHand.addCard(new Card(10,Suit.club))
playerHand.addCard(new Card(4,Suit.diamond))
playerHand.addCard(new Card(7,Suit.diamond))
//playerHand.addCard(new Card(11,Suit.diamond))
playerHand.addCard(new Card(6,Suit.diamond))
playerHand.getRank()
console.log(playerHand.rank)
console.log(playerHand.straightHigh)



