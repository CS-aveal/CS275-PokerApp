//
//  ContentView.swift
//  SocketApp
//
//  Created by Austin Veal on 10/17/22.
//

import SwiftUI
import SocketIO

class formattedData: Identifiable {
    var name = ""
    var arrS: [String]?
    var str: String?
    var int: Int?
    var intArr: [Int]?
    var id = 0
}



class DiffScreens: ObservableObject {
    
    @Published var home: Bool!
    @Published var createGame: Bool!
    @Published var joinGame: Bool!
    @Published var inGame: Bool!
    
    init() {
        
        self.home = true
        self.createGame = false
        self.joinGame = false
        self.inGame = false
        
    }
    
    
    
}




//might need a struct of card class
//or I might be able to just say if it is this certain card

final class Service: ObservableObject {
    private var manager = SocketManager(socketURL: URL(string: "ws://localhost:3000")!, config: [.log(true), .compress])
    
    @Published var stringMessages = [String]()
    @Published var stringArrayMessages = [[String]]()
    @Published var intMessages = [Int]()
    @Published var intArrayMessages = [[Int]]()
    @Published var messages = [formattedData]()
    @Published var otherPlayers = [String]()
    @Published var errorMessages = [String]()
    @Published var gameDetails = [String: String]()
    @Published var userCards = [String: String]()
    @Published var cardsInMiddle = [String: String]()
    //homescreen will be true by default

    //These have to be published attributes so that they will change and update in real time
    @Published var homeScreen = true
    @Published var createGameScreen = false
    @Published var joinGameScreen = false
    @Published var gameScreen = false
    @Published var playerTurn = false
    @Published var firstRound = false
    
    
    init() {
        let socket = manager.defaultSocket
        socket.on(clientEvent: .connect) { (data, ack) in
            print("Connected")
            
            /*
             Sending messages to the server at port "NodeJS Server Port"
             */
            
            socket.emit("NodeJS Server Port", "Hi node.js server!")
            socket.emit("Create Game", "New Poker Game")
            /*
            socket.emit("Join Game", )
             */
            socket.emit("Join Game", 1)
        }
        
        /*
         The app or iOS client is listening on port "iOS Client Port"
         */
        socket.on("iOS Client Port") { [weak self] (data, ack) in
            if let data = data[0] as? [String: String],
               let rawMessage = data["msg"]{
                DispatchQueue.main.async {
                    self?.stringMessages.append(rawMessage)
                }
            }
        }
        
        socket.on("Display Game") { [weak self] (data, ack) in
            for x in 0...(data.count - 1){
                if let data = data[x] as? [String: String]{
                    if let rawMessage = data["game"]{
                     DispatchQueue.main.async {
                         self?.errorMessages.append(rawMessage)
                     }
                    }
                    else if let rawMessage = data["buyin"]{
                     DispatchQueue.main.async {
                         self?.errorMessages.append(rawMessage)
                     }
                    }
                }
            }
        }
         
        socket.on("Join Game Successful") { [weak self] (data, ack) in
            if let data = data[0] as? [String: String],
               let rawmessage = data["msg"]{
                DispatchQueue.main.async {
                    self?.stringMessages.append(rawmessage)
                }
            }
        }
        socket.on("Create Success") { [weak self] (data, ack) in
            if let data = data[0] as? Int{
                DispatchQueue.main.async {
                    self?.stringMessages.append(String(data))
                }
            }
        }
        socket.on("New Player") { [weak self] (data, ack) in
            if let data = data[0] as? [String: String],
                let rawMessage = data["player"]{
                 DispatchQueue.main.async {
                     self?.otherPlayers.append(rawMessage)
                 }
             }
            
        }
        
        socket.on("Created Game") { [weak self] (data, ack) in
            if let data = data[0] as? [String: String],
                let rawMessage = data["msg"]{
                 DispatchQueue.main.async {
                     self?.otherPlayers.append(rawMessage)
                 }
             }
            
        }
        
        socket.on("Player Turn") { [weak self] (data, ack) in
            //either display the user controls or just un grey them so they are able to be clicked
            //display the user controls
            //depending on what the user did send that information back to the server
            self?.playerTurn = true
            if let data = data[0] as? [String: String],
                let rawMessage = data["msg"]{
                if (rawMessage == "Round 0"){
                    //ask for just the bet
                    self?.firstRound = true
                }
                else{
                    //not the first round
                }
                 DispatchQueue.main.async {
                     self?.otherPlayers.append(rawMessage)
                 }
             }
            
            
            //just an example but you get the point
            socket.emit("Player Turn Done", "Fold")
            
        }
        
        socket.on("Player Added") { [weak self] (data, ack) in
            //either display the user controls or just un grey them so they are able to be clicked
            //display the user controls
            //depending on what the user did send that information back to the server
            self?.playerTurn = true
            if let data = data[0] as? [String: String],
                let rawMessage = data["msg"]{
                 DispatchQueue.main.async {
                     self?.stringMessages.append(rawMessage)
                 }
             }
            
            
            //just an example but you get the point
            socket.emit("Player Turn Done", "Fold")
            
        }
        
        socket.on("Start Game") { [weak self] (data, ack) in
            //will need to now display the Game Screen
            //will set the game screen to be gameScreen
            //will set t
            if let data = data[0] as? [String: String],
                let rawMessage = data["msg"]{
                 DispatchQueue.main.async {
                     self?.otherPlayers.append(rawMessage)
                 }
             }
            
        }
        
        
        socket.on("Join Game Invalid") { [weak self] (data, ack) in
            if let data = data[0] as? [String: String],
                let rawMessage = data["msg"]{
                 DispatchQueue.main.async {
                     self?.errorMessages.append(rawMessage)
                 }
             }
            
        }
        
        socket.connect()
    }
    
    
    func sendPlayerTurn(turn: [String:String]){
        let socket = manager.defaultSocket
        socket.connect()
        socket.emit("Player Turn Done", turn)
    }
    
    func startGame(turn: [String:String]){
        let socket = manager.defaultSocket
        socket.connect()
        socket.emit("Start Game", turn)
    }
    
    func addPlayer(){
        let socket = manager.defaultSocket
        socket.connect()
        socket.emit("Add Player", "Player Joined")
    }
    
    func createRound(){
        let socket = manager.defaultSocket
        socket.connect()
        socket.emit("Start Round", "Create Round")
    }
    
    func sendCreateGame(_ code: Int,_ name: String, _ stake: String){
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
        settings.append(stake)
        
        socket.emit("Create Game", settings)
    }
    
}


struct ContentView: View {
    
    @EnvironmentObject var screens: DiffScreens
    
    var body: some View {
        
        if screens.home == true {
            AppHome()
        }
        if screens.inGame == true {
            inGameView()
        }
        if screens.createGame == true {
            createGameView()
        }
        if screens.joinGame == true {
            joinGameView()
        }
        
        
    } // Body view
    
} // ContentView

struct AppHome: View {
    
    @EnvironmentObject var screens: DiffScreens
    
    var body: some View {
            
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
                                self.screens.home = false
                                self.screens.createGame = true
                                
                                
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
                                self.screens.home = false
                                self.screens.joinGame = true
                                
                                
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
    
}

struct createGameView: View {
    
    @ObservedObject var screens: DiffScreens = DiffScreens()
    @ObservedObject var service = Service()
    
    @State private var name: String = ""
    @State private var stake: String = ""
    
    let stakes = ["High", "Medium", "Low"]
    let code = Int.random(in: 100...999)
   
    
    var body: some View {
        
        
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
                    service.sendCreateGame(code, name, stake)
                    
                }, label: {
                    Text("SUBMIT")
                        .font(.system(size: 30, weight: .bold, design: .monospaced))

                })
                
            
            }
            
            
        }
        
    }
    
}

struct joinGameView: View {
    
    @ObservedObject var screens: DiffScreens = DiffScreens()
    
    @State private var joinName: String = ""
    @State private var joinCode: String = ""
   
    
    var body: some View {
        
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
                    
                    
                    
                    
                }, label: {
                    Text("SUBMIT")
                        .font(.system(size: 30, weight: .bold, design: .monospaced))

                })
                
                Spacer()
                
            }
            
            
        }
        
    }
    
}

struct inGameView: View {
    
    @ObservedObject var screens: DiffScreens = DiffScreens()
    
    var p1Name = "Player 1"
    var p2Name = "Player 2"
    var p3Name = "Player 3"
    var p4Name = "Player 4"
    
    var p1Chips = 0.00
    var p2Chips = 0.00
    var p3Chips = 0.00
    var p4Chips = 0.00
    var potVal = 0.00
    
    
    var body: some View {
    
            ZStack{ // ZStack for background
                
                Image("backgroundpoker")
                    .resizable()
                    .frame(width:865.0, height: 425.0)
                
                
                VStack{ // Overall VStack
                    
                    Spacer()
                    
                    HStack{ // Two more players
                        Spacer()
                        
                        VStack { // Player 2
                            Text("\(p2Name)")
                                .bold()
                            
                            
                            HStack{ // Two Cards
                                Image("backOfCard")
                                Image("backOfCard")
                                
                            }
                            
                            Text("$ \(p2Chips, specifier: "%.2f")")
                                .bold()
                        }
                        
                        Spacer()
                        
                        VStack { // Player 3
                            Text("\(p3Name)")
                                .bold()
                            
                            HStack{ // Two Cards
                                Image("backOfCard")
                                Image("backOfCard")
                            }
                            
                            Text("$ \(p3Chips, specifier: "%.2f")")
                                .bold()
                        }
                        
                        Spacer()
                        
                    }
                    
                    Spacer()
                    
                    HStack { // Two Players and Pot Value
                        
                        VStack { // Player 1
                            Text("\(p1Name)")
                                .bold()
                            
                            HStack{ // Two Cards
                                Image("backOfCard")
                                Image("backOfCard")
                            }
                            
                            Text("$ \(p1Chips, specifier: "%.2f")")
                                .bold()
                            
                        }
                        .padding(.leading, 55)
                        .padding(.bottom, 15)
                        
                        Spacer()
                        
                        VStack { // 5 delt cards and pot value
                            
                            HStack{ // 5 delt cards
                                Image("backOfCard")
                                Image("backOfCard")
                                Image("backOfCard")
                                Image("backOfCard")
                                Image("backOfCard")
                            }
                            
                            Text("$ \(potVal, specifier: "%.2f")")
                                .font(.system(size: 30, weight: .bold, design: .monospaced))
                            
                        }
                        .padding(.top, 25)
                        
                        Spacer()
                        
                        VStack { // Player 4
                            
                            
                            
                            Text("\(p4Name)")
                                .bold()
                            
                            HStack{ // Two Cards
                                Image("backOfCard")
                                Image("backOfCard")
                            }
                            
                            Text("$ \(p4Chips, specifier: "%.2f")")
                                .bold()
                            
                        }
                        .padding(.trailing, 55)
                        .padding(.bottom, 15)
                    }
                    
                    Spacer()
                    
                    HStack{ // Buttons
                        Spacer()
                        
                        Button(action: {
                            // Bet action
                        }, label: {
                            Text("BET")
                                .foregroundColor(Color.black)
                                .padding(.leading, 70)
                        })
                        
                        Spacer()
                        
                        Button(action: {
                            // Call action
                        }, label: {
                            Text("CALL")
                                .foregroundColor(Color.black)
                        })
                        
                        Spacer()
                        
                        Button(action: {
                            // Check action
                        }, label: {
                            Text("CHECK")
                                .foregroundColor(Color.black)
                        })
                        
                        Spacer()
                        
                        Button(action: {
                            // Fold action
                        }, label: {
                            Text("FOLD")
                                .foregroundColor(Color.black)
                        })
                        
                        Spacer()
                        Spacer()
                    }
                    .font(.system(size: 30, weight: .bold, design: .monospaced))
                    .padding(.bottom, 25)
                    
                    
                } // Overall VStack
                
            } // Overall ZStack
        
    } // Body view
    
}


struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .previewInterfaceOrientation(.landscapeLeft)

    }
}

