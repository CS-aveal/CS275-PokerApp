const Suit = {
    spade: 0,
    club: 1,
    diamond: 2,
    heart: 3
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

let deck = new Deck();
deck.shuffle();
console.log(deck.cardDeck);
console.log(deck.popTop())
console.log(deck.cardDeck);





