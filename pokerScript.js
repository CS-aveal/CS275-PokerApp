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
                    this.threeOthers.push(handRev[c]);
                }
            }
        }
        //check two pair
    }
}


let playerHand = new PlayerHand()
playerHand.addCard(new Card(8,Suit.club))
playerHand.addCard(new Card(13,Suit.diamond))
playerHand.addCard(new Card(6,Suit.diamond))
playerHand.addCard(new Card(6,Suit.diamond))
playerHand.addCard(new Card(10,Suit.diamond))
playerHand.addCard(new Card(10,Suit.diamond))
playerHand.addCard(new Card(3,Suit.diamond))
playerHand.getRank()
console.log(playerHand.rank)
console.log(playerHand.firstPairRank)
console.log(playerHand.threeOthers)




