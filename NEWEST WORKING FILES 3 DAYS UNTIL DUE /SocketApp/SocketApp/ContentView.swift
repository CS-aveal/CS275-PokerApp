//
//  ContentView.swift
//  PokerSwiftUI
//
//  Created by Matthew McCarthy on 10/19/22.
//

import SwiftUI
import SocketIO



var screensArray: [DiffScreens] = []

struct ServiceList {
    let service1: Service
    
    init(){
        service1 = Service()
    }
}



class DiffScreens: ObservableObject {
    
    @Published var home: Bool!
    @Published var createGame: Bool!
    @Published var joinGame: Bool!
    @Published var waiting: Bool!
    @Published var inGame: Bool!
    @Published var isHost: Bool!
    
    
    
    init() {
        
        self.home = true
        self.createGame = false
        self.joinGame = false
        self.waiting = false
        self.inGame = false
        self.isHost = false
        
    }
    
    
}



final class Service: ObservableObject {
    private var manager = SocketManager(socketURL:URL(string:"ws://localhost:3000")!, config: [.log(true), .compress])
    
    
    @Published var home: Bool!
    @Published var playerTurn: Bool!
    @Published var createGame: Bool!
    @Published var joinGame: Bool!
    @Published var waiting: Bool!
    @Published var inGame: Bool!
    @Published var isHost: Bool!
    @Published var changed1: Bool!
    @Published var CheckScreen: Bool!
    @Published var CallScreen: Bool!
    @Published var RaiseScreen: Bool!
    @Published var raiseSlider: Bool!
    @Published var foldCallRaise: Bool!
    @Published var foldCall: Bool!
    @Published var player1Fold: Bool!
    @Published var player2Fold: Bool!
    @Published var player3Fold: Bool!
    @Published var player4Fold: Bool!
    @Published var player1Name: String!
    @Published var player2Name: String!
    @Published var player3Name: String!
    @Published var player4Name: String!
    @Published var usersName: String!
    @Published var minRaise: Double!
    @Published var maxRaise: Double!
    @Published var callAmount: Int!
    @Published var userPlayerNum: Int!
    @Published var player1Stack: Int!
    @Published var player2Stack: Int!
    @Published var player3Stack: Int!
    @Published var player4Stack: Int!
    @Published var potVal: Int!
    @Published var p1Card1 = ""
    @Published var p1Card2 = ""
    
    @Published var userCard1 = ""
    @Published var userCard2 = ""
    
    @Published var p2Card1 = ""
    @Published var p2Card2 = ""
    
    @Published var p3Card1 = ""
    @Published var p3Card2 = ""
    
    @Published var p4Card1 = ""
    @Published var p4Card2 = ""
    
    
    @Published var potCard1 = "backOfCard"
    @Published var potCard2 = "backOfCard"
    @Published var potCard3 = "backOfCard"
    @Published var potCard4 = "backOfCard"
    @Published var potCard5 = "backOfCard"
    
    
    @Published var stringMessages = [String]()
    @Published var changed: Bool!
    
    init() {
        let socket = manager.defaultSocket
        self.changed = false
        self.changed1 = false
        
        self.home = true
        self.createGame = false
        self.joinGame = false
        self.waiting = false
        self.inGame = false
        self.isHost = false
        self.CheckScreen = false
        self.CallScreen = false
        self.RaiseScreen = false
        self.raiseSlider = false
        self.foldCallRaise = false
        self.playerTurn = false
        self.player1Fold = false
        self.player2Fold = false
        self.player3Fold = false
        self.player4Fold = false
        self.player1Stack = 0
        self.player2Stack = 0
        self.player3Stack = 0
        self.player4Stack = 0
        self.potVal = 0
        self.callAmount = 0
        self.userPlayerNum = 0
        self.player1Name = ""
        self.player2Name = ""
        self.player3Name = ""
        self.player4Name = ""
        self.usersName = ""
        
        socket.on(clientEvent: .connect) { (data, ack) in
            print("Connected")
            
            /*
             Sending messages to the server at port "NodeJS Server Port"
             */
            
            /*
            
            socket.emit("NodeJS Server Port", "Hi node.js server!")
            socket.emit("Create Game", "New Poker Game")
            /*
            socket.emit("Join Game", )
             */
            socket.emit("Join Game", 1)
             
             */
        }
        socket.connect()
        
        socket.on("Create Success") { [weak self] (data, ack) in
            if let data = data[0] as? Int{
                DispatchQueue.main.async {
                    self?.stringMessages.append(String(data))
                    
                }
            }
            self?.changed = true
        }
        
        socket.on("Player Folded") { [weak self] (data, ack) in
            if let data = data[0] as? Int{
                DispatchQueue.main.async {
                    self?.stringMessages.append(String(data))
                    
                }
            }
            self?.changed = true
        }
        
        socket.on("No Check Turn") { [weak self] (data, ack) in
            self?.playerTurn = true
            self?.CallScreen = true
            self?.RaiseScreen = true
            //self?.inGame = false
            for x in 0...(data.count - 1){
                if let data = data[x] as? [String: Int]{
                    
                    if let rawMessage = data["Min Raise Amount"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            self?.minRaise = Double(rawMessage)
                            
                        }
                    }
                    if let rawMessage = data["Max Raise Amount"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            self?.maxRaise = Double(rawMessage)
                            
                        }
                    }
                    if let rawMessage = data["Call Amount"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            self?.callAmount = rawMessage
                            
                        }
                    }
                    
                }
            }
        }
        socket.on("No Call Turn") { [weak self] (data, ack) in
            self?.playerTurn = true
            self?.CheckScreen = true
            self?.RaiseScreen = true
            //self?.inGame = false
        }
        
        
        socket.on("Fold Call Raise Turn") { [weak self] (data, ack) in
            self?.CheckScreen = true
            self?.playerTurn = true
            self?.RaiseScreen = true
            for x in 0...(data.count - 1){
                if let data = data[x] as? [String: Int]{
                    
                    if let rawMessage = data["Raise Amount"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            self?.minRaise = Double(rawMessage)
                            self?.maxRaise = Double(rawMessage)
                            
                        }
                    }
                }
            }
            
        }
        socket.on("Update Pot Val") { [weak self] (data, ack) in
            if let data = data[0] as? Int{
                DispatchQueue.main.async {
                        //self?.errorMessages.append(rawMessage)
                    self?.potVal = data
                        
                }
            }
        }
        socket.on("Update Player Stack") { [weak self] (data, ack) in
            var playerIndex = 0;
            for x in 0...(data.count - 1){
                if let data = data[x] as? [String: Int]{
                    if let rawMessage = data["Player Index"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            playerIndex = rawMessage
                            
                        }
                    }
                    if let rawMessage = data["Player Stack"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            if (playerIndex == 0){
                                self?.player1Stack = rawMessage
                            }
                            else if (playerIndex == 1){
                                self?.player2Stack = rawMessage
                            }
                            else if (playerIndex == 2){
                                self?.player3Stack = rawMessage
                            }
                            else if (playerIndex == 3){
                                self?.player4Stack = rawMessage
                            }
                            
                            
                        }
                    }
                }
            }
        }
            
        
        socket.on("Fold Call Turn") { [weak self] (data, ack) in
            self?.playerTurn = true
            self?.CallScreen = true
            for x in 0...(data.count - 1){
                if let data = data[x] as? [String: Int]{
                    
                    if let rawMessage = data["Call Amount"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            self?.callAmount = rawMessage
                            
                        }
                    }
                }
            }
            
        }
        
        socket.on("Reset Pot Cards") { [weak self] (data, ack) in
            self?.potCard1 = "backOfCard"
            self?.potCard2 = "backOfCard"
            self?.potCard3 = "backOfCard"
            self?.potCard4 = "backOfCard"
            self?.potCard5 = "backOfCard"
            
        }
        
        socket.on("Player Index") { [weak self] (data, ack) in
            for x in 0...(data.count - 1){
                if let data = data[x] as? [String: Int]{
                    if let rawMessage = data["Player Index"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            self?.userPlayerNum = rawMessage
                            
                        }
                    }
                }
            }
            
        }
        
        socket.on("Display UserCard Info") { [weak self] (data, ack) in
            for x in 0...(data.count - 1){
                if let data = data[x] as? [String: String]{
                    self?.changed1 = true
                    if let rawMessage = data["Player1 Card1"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            self?.p1Card1 = rawMessage
                            if (self?.userPlayerNum == 1){
                                self?.userCard1 = rawMessage
                            }
                            
                        }
                    }
                    if let rawMessage = data["Player1 Card2"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            self?.p1Card1 = rawMessage
                            if (self?.userPlayerNum == 1){
                                self?.userCard2 = rawMessage
                            }
                        }
                    }
                    if let rawMessage = data["Player2 Card1"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            self?.p1Card1 = rawMessage
                            if (self?.userPlayerNum == 2){
                                self?.userCard1 = rawMessage
                            }
                        }
                    }
                    if let rawMessage = data["Player2 Card2"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            self?.p1Card1 = rawMessage
                            if (self?.userPlayerNum == 2){
                                self?.userCard2 = rawMessage
                            }
                            
                        }
                    }
                    if let rawMessage = data["Player3 Card1"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            self?.p1Card1 = rawMessage
                            if (self?.userPlayerNum == 3){
                                self?.userCard1 = rawMessage
                            }
                        }
                    }
                    if let rawMessage = data["Player3 Card2"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            self?.p1Card1 = rawMessage
                            if (self?.userPlayerNum == 3){
                                self?.userCard2 = rawMessage
                            }
                        }
                    }
                    if let rawMessage = data["Player4 Card1"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            self?.p1Card1 = rawMessage
                            if (self?.userPlayerNum == 4){
                                self?.userCard1 = rawMessage
                            }
                            
                        }
                    }
                    if let rawMessage = data["Player4 Card2"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            self?.p1Card1 = rawMessage
                            if (self?.userPlayerNum == 4){
                                self?.userCard2 = rawMessage
                            }
                            
                        }
                    }
                }
            }
            
        }
        
        socket.on("Display PotCard Info") { [weak self] (data, ack) in
            for x in 0...(data.count - 1){
                if let data = data[x] as? [String: String]{
                    self?.changed1 = true
                    if let rawMessage = data["Pot Card1"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            self?.potCard1 = rawMessage
                            
                        }
                    }
                    if let rawMessage = data["Pot Card2"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            self?.potCard2 = rawMessage
                            
                        }
                    }
                    if let rawMessage = data["Pot Card3"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            self?.potCard3 = rawMessage
                            
                        }
                    }
                    if let rawMessage = data["Pot Card4"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            self?.potCard4 = rawMessage
                            
                        }
                    }
                    if let rawMessage = data["Pot Card5"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            self?.potCard5 = rawMessage
                            
                        }
                    }
                }
            }
            
        }
        
        socket.on("Start Game") { [weak self] (data, ack) in
            for x in 0...(data.count - 1){
                if let data = data[x] as? [String: String]{
                    self?.changed1 = true
                    if let rawMessage = data["Player1"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            self?.player1Name = rawMessage
                            if (rawMessage == self?.usersName){
                                
                            }

                        }
                    }
                    if let rawMessage = data["Player2"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            //self?.player2Name = rawMessage
                            self?.player2Name = rawMessage
                        }
                    }
                    if let rawMessage = data["Player3"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            self?.player3Name = rawMessage
                        }
                    }
                    if let rawMessage = data["Player4"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            self?.player4Name = rawMessage
                        }
                    
                    }
                    
                    if let rawMessage = data["Player1 Stack"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            self?.player1Stack = Int(rawMessage)
                        }

                    }
                    if let rawMessage = data["Player2 Stack"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            self?.player2Stack = Int(rawMessage)
                        }

                    }
                    if let rawMessage = data["Player3 Stack"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            self?.player3Stack = Int(rawMessage)
                        }

                    }
                    if let rawMessage = data["Player4 Stack"]{
                        DispatchQueue.main.async {
                            //self?.errorMessages.append(rawMessage)
                            self?.player4Stack = Int(rawMessage)
                        }

                    }
                }
            }
            self?.inGame = true
            self?.waiting = false
            
        }
        
    }
    
    func sendCreateGame(_ code: Int,_ name: String, _ stake: String){
        //settings is a dictionary
        //this is so that I am able to pass all of the settings with the key word being the setting
        //ie pot size and the value being the value of the pot size
        var settings: [String] = []
        var codeString: String
        
        codeString = String(code)
        
        self.usersName = name
        
        let socket = manager.defaultSocket
        socket.connect()
        settings.append(codeString)
        settings.append(name)
        settings.append(stake)
        
        socket.emit("Create Game", settings)
    }
    
    func sendJoinGame(_ code: String,_ name: String){
        //settings is a dictionary
        //this is so that I am able to pass all of the settings with the key word being the setting
        //ie pot size and the value being the value of the pot size
        var settings: [String] = []
        var codeString: String
        
        codeString = String(code)
        
        let socket = manager.defaultSocket
        socket.connect()
        settings.append(codeString)
        settings.append(name)
        
        socket.emit("Join Game", settings)
    }
    
    func sendStartGame(_ code: String){
        //settings is a dictionary
        //this is so that I am able to pass all of the settings with the key word being the setting
        //ie pot size and the value being the value of the pot size
        var settings: [String] = []
        var codeString: String
        
        codeString = String(code)
        
        let socket = manager.defaultSocket
        socket.connect()
        settings.append(codeString)
        
        
        socket.emit("Start Game", settings)
    }
    
    func switchHomeToCreate(){
        home = false
        createGame = true
    }
    func sendBet(_ bet: Double){
        
        var turnInfo: [String] = []
        let socket = manager.defaultSocket
        socket.connect()
        turnInfo.append("Bet")
        turnInfo.append(String(bet))
        
        socket.emit("Send Bet", turnInfo)
    }
    func sendCall(){
        
        let socket = manager.defaultSocket
        socket.connect()
        
        socket.emit("Send Call", "")
    }
    
    func sendFold(){
        
        let socket = manager.defaultSocket
        socket.connect()
        
        socket.emit("Send Fold", "")
    }
    func sendCheck(){
        
        let socket = manager.defaultSocket
        socket.connect()
        
        socket.emit("Send Check", "")
    }
    
}

class Observables: ObservableObject {
    
    @Published var playerID: Int!
    
    init() {
        
        self.playerID = 0
        
    }
    
}

struct ContentView: View {
    
    
    @ObservedObject var service = Service()
    
    @State private var name: String = ""
    @State private var stake: String = ""
    
    let stakes = ["High", "Medium", "Low"]
    let code = Int.random(in: 100...999)
    
    @State private var joinName: String = ""
    @State private var joinCode: String = ""
    
    @State private var p1Card1 = "backOfCard"
    @State private var p1Card2 = "backOfCard"
    @State private var p2Card1 = "backOfCard"
    @State private var p2Card2 = "backOfCard"
    @State private var p3Card1 = "backOfCard"
    @State private var p3Card2 = "backOfCard"
    @State private var p4Card1 = "backOfCard"
    @State private var p4Card2 = "backOfCard"
    @State private var greyedOutCard = "backOfCardBW"
    
    
    @State private var p1Chips = 0.00
    @State private var p2Chips = 0.00
    @State private var p3Chips = 0.00
    @State private var p4Chips = 0.00
    @State private var potVal = 0.00
    
    @State private var raiseVal = 0.00
    @State private var lowerRaise = 0.00
    @State private var upperRaise = 100.00
    
    @State private var callVar = 0.00
    
    
    @State private var potCard1 = "backOfCard"
    @State private var potCard2 = "backOfCard"
    @State private var potCard3 = "backOfCard"
    @State private var potCard4 = "backOfCard"
    @State private var potCard5 = "backOfCard"
    
    var body: some View {
        
        if service.home == true {
            ZStack {
                
                Image("Homepage")
                    .resizable()
                    .frame(width:865.0, height: 425.0)
                
                // game creation
                // 4 digit game code
                // low medium high stakes ( sets the values of all the blinds)
                    // buy in values ( set values per stakes)
                // game join
                // box to type in code
                // joined to game automatically
                
                VStack {
                    
                    Spacer()
                    Spacer()
                    Spacer()
                    
                    HStack{
                            Spacer()
                        
                            Button(action: {
                                // Change to create game screen
                                service.switchHomeToCreate()
                                
                                
                                
                            }, label: {
                                Text("Create")
                                    .padding()
                                    .foregroundColor(Color.black)
                                    .background(Color.white)
                                    .border(Color.black, width: 3)
                                    .font(.system(size: 30, weight: .bold, design: .monospaced))
                            })
                        
                            Spacer()
                            
                            Button(action: {
                                // Change to join game screen
                                self.service.home = false
                                self.service.joinGame = true
                                
                                
                            }, label: {
                                Text("Join")
                                    .padding()
                                    .padding(.leading, 20)
                                    .padding(.trailing, 20)
                                    .foregroundColor(Color.black)
                                    .background(Color.white)
                                    .border(Color.black, width: 3)
                                    .font(.system(size: 30, weight: .bold, design: .monospaced))
                            })
                        
                            Spacer()
                            
                    }
                    
                    Spacer()
                    
                }
            }
            
        }
        if service.inGame == true {
            Text("INGAME")
            ZStack{ // ZStack for background
                
                Image("backgroundpoker")
                    .resizable()
                    .frame(width:865.0, height: 425.0)
                
                
                VStack{ // Overall VStack
                    
                    Spacer()
                    
                    HStack{ // Two more players
                        Spacer()
                        
                        VStack { // Player 2
                            Text("\(service.player2Name)")
                                .bold()
                            
                            
                            if (service.userPlayerNum == 2){
                                
                                if (service.player2Fold){
                                    //this will be the greyed out versions of the card
                                    HStack{ // Two Cards
                                        Image("\(greyedOutCard)")
                                        Image("\(greyedOutCard)")

                                    }
                                }
                                else{
                                    HStack{ // Two Cards
                                        Image("\(service.userCard1)")
                                        Image("\(service.userCard2)")
                                        
                                    }
                                }
                                
                            }
                            else{
                                if (service.player2Fold){
                                    //greyed out version
                                    HStack{ // Two Cards
                                        Image("\(greyedOutCard)")
                                        Image("\(greyedOutCard)")
                                        
                                    }
                                }
                                else{
                                    HStack{ // Two Cards
                                        Image("\(p2Card1)")
                                        Image("\(p2Card2)")
                                        
                                    }
                                }
                            }
                            
                            Text("$ \(service.player2Stack)")
                                .bold()
                        }
                        
                        Spacer()
                        
                        VStack { // Player 3
                            Text("\(service.player3Name)")
                                .bold()
                            
                            if (service.userPlayerNum == 3){
                                
                                if (service.player3Fold){
                                    //greyed out versions
                                    HStack{ // Two Cards
                                        Image("\(greyedOutCard)")
                                        Image("\(greyedOutCard)")
                                    }
                                }
                                else{
                                    HStack{ // Two Cards
                                        Image("\(service.userCard1)")
                                        Image("\(service.userCard2)")
                                    }
                                }
                            }
                            else{
                                if (service.player3Fold){
                                    //greyed out version
                                    HStack{ // Two Cards
                                        Image("\(greyedOutCard)")
                                        Image("\(greyedOutCard)")
                                    }
                                }
                                else{
                                    HStack{ // Two Cards
                                        Image("\(p3Card1)")
                                        Image("\(p3Card2)")
                                    }
                                }
                            }
                            
                            Text("$ \(service.player3Stack)")
                                .bold()
                        }
                        
                        Spacer()
                        
                    }
                    
                    Spacer()
                    
                    HStack { // Two Players and Pot Value
                        
                        VStack { // Player 1
                            Text("\(service.player1Name)")
                                .bold()
                            
                            if (service.userPlayerNum == 1){
                                if (service.player1Fold){
                                    //greyed out versions of cards
                                    HStack{ // Two Cards
                                        Image("\(greyedOutCard)")
                                        Image("\(greyedOutCard)")
                                    }
                                }
                                else{
                                    HStack{ // Two Cards
                                        Image("\(service.userCard1)")
                                        Image("\(service.userCard2)")
                                    }
                                }
                            }
                            else{
                                if (service.player1Fold){
                                    //greyed out versions
                                    HStack{ // Two Cards
                                        Image("\(greyedOutCard)")
                                        Image("\(greyedOutCard)")
                                    }
                                }
                                else{
                                    HStack{ // Two Cards
                                        Image("\(p1Card1)")
                                        Image("\(p1Card2)")
                                    }
                                }

                            }
                            
                            
                            Text("$ \(service.player1Stack)")
                                .bold()
                            
                        }
                        .padding(.leading, 55)
                        .padding(.bottom, 15)
                        
                        Spacer()
                        
                        VStack { // 5 delt cards and pot value
                            
                            HStack{ // 5 delt cards
                                
                                //these will need to be service variables to be able to be changed
                                Image("\(service.potCard5)")
                                Image("\(service.potCard4)")
                                Image("\(service.potCard3)")
                                Image("\(service.potCard2)")
                                Image("\(service.potCard1)")
                            }
                            
                            Text("$ \(service.potVal)")
                                .font(.system(size: 30, weight: .bold, design: .monospaced))
                            
                        }
                        .padding(.top, 25)
                        
                        Spacer()
                        
                        VStack { // Player 4
                            
                            
                            
                            Text("\(service.player4Name)")
                                .bold()
                            
                            if (service.userPlayerNum == 4){
                                if (service.player4Fold){
                                    //greyed out versions
                                    HStack{ // Two Cards
                                        Image("\(greyedOutCard)")
                                        Image("\(greyedOutCard)")
                                    }
                                }
                                else{
                                    HStack{ // Two Cards
                                        Image("\(service.userCard1)")
                                        Image("\(service.userCard2)")
                                    }
                                }
                                
                            }
                            else{
                                if (service.player4Fold){
                                    HStack{ // Two Cards
                                        Image("\(greyedOutCard)")
                                        Image("\(greyedOutCard)")
                                    }
                                }
                                else{
                                    HStack{ // Two Cards
                                        Image("\(p4Card1)")
                                        Image("\(p4Card2)")
                                    }
                                }
                            }
                            
                            Text("$ \(service.player4Stack)")
                                .bold()
                            
                        }
                        .padding(.trailing, 55)
                        .padding(.bottom, 15)
                    }
                    
                    Spacer()
                    if service.playerTurn == true{
                        HStack{ // Buttons
                            Spacer()
                            
                            if service.RaiseScreen == true{
                            
                                Button(action: {
                                    // Raise action
                                    
                                    self.service.raiseSlider = true
                                    self.service.inGame = false
                                    
                                    
                                }, label: {
                                    Text("RAISE")
                                        .foregroundColor(Color.black)
                                        .padding(.leading, 70)
                                })
                            
                            }
                            if service.CallScreen == true {
                                
                                Spacer()
                                
                                Button(action: {
                                    // Call action
                                    service.sendCall()
                                    self.service.playerTurn = false
                                    self.service.CallScreen = false
                                    self.service.RaiseScreen = false
                                }, label: {
                                    Text("CALL \(service.callAmount)")
                                        .foregroundColor(Color.black)
                                })
                                
                            }
                            
                            
                            if service.CheckScreen == true {
                                
                                Spacer()
                                
                                Button(action: {
                                    // Check action
                                    service.sendCheck()
                                    self.service.playerTurn = false
                                    self.service.RaiseScreen = false
                                    self.service.CheckScreen = false
                                }, label: {
                                    Text("CHECK")
                                        .foregroundColor(Color.black)
                                })
                                
                                
                            }
                            
                            Spacer()
                            
                            Button(action: {
                                // Fold action
                                service.sendFold()
                                self.service.playerTurn = false
                            }, label: {
                                Text("FOLD")
                                    .foregroundColor(Color.black)
                            })
                            
                            Spacer()
                            Spacer()
                        }
                        .font(.system(size: 30, weight: .bold, design: .monospaced))
                        .padding(.bottom, 25)
                    
                    }
                    else{
                        Spacer()
                        Spacer()
                    }
                    
                } // Overall VStack
                
            }
        }
        if service.raiseSlider == true {
            
            ZStack{
                
                Color.green
                    .ignoresSafeArea()
                
                VStack{
                    
                    Spacer()
                    
                    Slider(value: $raiseVal, in: service.minRaise...service.maxRaise)
                        .frame(width: 300)
                    
                    Text("Selected raise amount: \(raiseVal, specifier: "%.2f")")
                        .font(.system(size: 30, weight: .bold, design: .monospaced))
                    
                    Spacer()
                    HStack{
                        
                        Spacer()
                        
                        Button(action: {
                            
                            self.service.inGame = true
                            self.service.raiseSlider = false
                            
                            
                            
                            
                        }, label: {
                            Text("BACK TO GAME")
                                .font(.system(size: 30, weight: .bold, design: .monospaced))
                        })

                        Spacer()
                        
                        Button(action: {
                            
                            self.service.inGame = true
                            self.service.raiseSlider = false
                            self.service.playerTurn = false
                            self.service.RaiseScreen = true
                            service.sendBet(raiseVal)
                            
                            
                        }, label: {
                            Text("SUBMIT RAISE")
                                .font(.system(size: 30, weight: .bold, design: .monospaced))
                        })
                        
                        Spacer()
                    }
                    Spacer()
                        
                    
                }
                
            }
            
        }
        
        
        if service.createGame == true {
            ZStack {
                
                Color.green
                    .ignoresSafeArea()
                
                VStack{
                    
                    Spacer()
                    
                    Text("Your Game Code: \(code)")
                        .font(.system(size: 30, weight: .bold, design: .monospaced))
                    
                    Spacer()
                    
                    Text("Player name: ")
                        .font(.system(size: 25, weight: .bold, design: .monospaced))
                    
                    TextField("Enter here...", text: $name)
                        .multilineTextAlignment(.center)
                        .foregroundColor(Color.white)
                        .font(.system(size: 25, weight: .bold, design: .monospaced))
                    
                    Spacer()
                    
                    Text("Selected Stake: \(stake)")
                        .font(.system(size: 20, weight: .bold, design: .monospaced))
                    
                    Picker("Select a stake to play with", selection: $stake) {
                        
                        ForEach(stakes, id: \.self) {
                            
                            Text($0)
                        }
                        .pickerStyle(.menu)
                        
                    }
                    
                    Spacer()
                    
                    Button(action: {
                        
                        //submit
                        
                        self.service.isHost = true
                        self.service.createGame = false
                        self.service.waiting = true
                        service.sendCreateGame(code, name, stake)
                        //code then name then stake
                        //ServiceList.service.sendCreateGame(code, name, stake)
                        
                        
                        
                    }, label: {
                        Text("SUBMIT")
                            .font(.system(size: 30, weight: .bold, design: .monospaced))

                    })
                    
                
                }
                
                
            }
        }
        if service.joinGame == true {
            ZStack {
                
                Color.green
                    .ignoresSafeArea()
                
                VStack{
                    
                    Spacer()
                    
                    Text("Joining Poker Match...")
                        .font(.system(size: 30, weight: .bold, design: .monospaced))
                    
                    Spacer()
                    
                    TextField("Enter the game code: ", text: $joinCode)
                        .multilineTextAlignment(.center)
                        .foregroundColor(Color.white)
                        .font(.system(size: 25, weight: .bold, design: .monospaced))
                    
                    Spacer()
                    
                    TextField("Enter your name: ", text: $joinName)
                        .multilineTextAlignment(.center)
                        .foregroundColor(Color.white)
                        .font(.system(size: 25, weight: .bold, design: .monospaced))
                    
                    Spacer()
                    
                    Button(action: {
                        
                        //submit
                        
                        
                        self.service.joinGame = false
                        self.service.waiting = true
                        service.sendJoinGame(joinCode, joinName)
                        
                        
                    }, label: {
                        Text("SUBMIT")
                            .font(.system(size: 30, weight: .bold, design: .monospaced))

                    })
                    
                    Spacer()
                    
                }
                
                
            }
        }
        if service.waiting == true {
            ZStack {
                
                Color.green
                    .ignoresSafeArea()
                
                // If user is host
                if self.service.isHost {
                    
                    VStack{
                        
                        Spacer()
                        
                        Text("Game Code: \(code)")
                            .font(.system(size: 30, weight: .bold, design: .monospaced))
                        
                        Spacer()
                        
                        Text("Waiting for host to start the game...")
                            .font(.system(size: 30, weight: .bold, design: .monospaced))
                        
                        Spacer()
                        
                        if service.changed == true {
                            Text("SendBack Successful")
                        }
                        
                        // Start game button
                        Button(action: {
                            
                            //Start game action
                            
                            
                            self.service.waiting = false
                            self.service.inGame = true
                            service.sendStartGame(String(code))
                            
                            
                        }, label: {
                            Text("START GAME")
                                .font(.system(size: 30, weight: .bold, design: .monospaced))

                        })
                        
                        
                        
                        
                    }
                    
                    
                    
                }
                // If user is not host
                if !self.service.isHost {
                    
                    
                    VStack{
                        

                        
                        Text("Waiting for host to start the game...")
                            .font(.system(size: 30, weight: .bold, design: .monospaced))
                        
                        
                        
                    }
                    
                }
            
                
            }
        }
        
        
    } // Body view
    
    func changeScreen(_ option: String){
        
    }
    
} // ContentView



struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .previewInterfaceOrientation(.landscapeLeft)
            .environmentObject(DiffScreens())

    }
}


