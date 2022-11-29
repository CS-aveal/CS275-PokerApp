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
    private var manager = SocketManager(socketURL: URL(string: "ws://localhost:3000")!, config: [.log(true), .compress])
    
    
    @Published var home: Bool!
    @Published var createGame: Bool!
    @Published var joinGame: Bool!
    @Published var waiting: Bool!
    @Published var inGame: Bool!
    @Published var isHost: Bool!
    @Published var noCheckscreen: Bool!
    @Published var noCallscreen: Bool!
    
    
    @Published var stringMessages = [String]()
    @Published var changed: Bool!
    
    init() {
        let socket = manager.defaultSocket
        self.changed = false
        
        self.home = true
        self.createGame = false
        self.joinGame = false
        self.waiting = false
        self.inGame = false
        self.isHost = false
        self.noCheckscreen = false
        self.noCallscreen = false
        
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
        
        socket.on("Start Game") { [weak self] (data, ack) in
            //self.screens
            self?.inGame = true
            self?.waiting = false
            
        }
        socket.on("No Check Turn") { [weak self] (data, ack) in
            
            self?.noCheckscreen = true
            self?.inGame = false
        }
        socket.on("No Check Turn") { [weak self] (data, ack) in
            
            self?.noCallscreen = true
            self?.inGame = false
        }
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
    
    
    @State private var p1Name = "Player 1"
    @State private var p2Name = "Player 2"
    @State private var p3Name = "Player 3"
    @State private var p4Name = "Player 4"
    
    @State private var p1Chips = 0.00
    @State private var p2Chips = 0.00
    @State private var p3Chips = 0.00
    @State private var p4Chips = 0.00
    @State private var potVal = 0.00
    
    @State private var p1Card1 = "backOfCard"
    @State private var p1Card2 = "backOfCard"
    
    @State private var p2Card1 = "backOfCard"
    @State private var p2Card2 = "backOfCard"
    
    @State private var p3Card1 = "backOfCard"
    @State private var p3Card2 = "backOfCard"
    
    @State private var p4Card1 = "backOfCard"
    @State private var p4Card2 = "backOfCard"
    
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
                                Image("\(p2Card1)")
                                Image("\(p2Card2)")
                                
                            }
                            
                            Text("$ \(p2Chips, specifier: "%.2f")")
                                .bold()
                        }
                        
                        Spacer()
                        
                        VStack { // Player 3
                            Text("\(p3Name)")
                                .bold()
                            
                            HStack{ // Two Cards
                                Image("\(p3Card1)")
                                Image("\(p3Card2)")
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
                                Image("\(p1Card1)")
                                Image("\(p1Card2)")
                            }
                            
                            Text("$ \(p1Chips, specifier: "%.2f")")
                                .bold()
                            
                        }
                        .padding(.leading, 55)
                        .padding(.bottom, 15)
                        
                        Spacer()
                        
                        VStack { // 5 delt cards and pot value
                            
                            HStack{ // 5 delt cards
                                Image("\(potCard5)")
                                Image("\(potCard4)")
                                Image("\(potCard3)")
                                Image("\(potCard2)")
                                Image("\(potCard1)")
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
                                Image("\(p4Card1)")
                                Image("\(p4Card2)")
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
                        
                        Text("Waiting for host to start the game...")
                            .font(.system(size: 30, weight: .bold, design: .monospaced))
                        
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


