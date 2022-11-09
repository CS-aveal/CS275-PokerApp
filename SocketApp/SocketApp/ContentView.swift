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


//homescreen will be true by default
var homeScreen = true
var firstRound = false
var createGameScreen = false
var joinGameScreen = false
var gameScreen = false
var playerTurn = false

class GameInformation: ObservableObject {
    @Published var usersCards = []
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
            playerTurn = true
            if let data = data[0] as? [String: String],
                let rawMessage = data["msg"]{
                if (rawMessage == "Round 0"){
                    //ask for just the bet
                    firstRound = true
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
        
        socket.on("Start Game") { [weak self] (data, ack) in
            //will need to now display the Game Screen
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
        socket.emit("Send Data", turn)
    }
    
    func sendCreateGame(settings: [String:String]){
        //settings is a dictionary
        //this is so that I am able to pass all of the settings with the key word being the setting
        //ie pot size and the value being the value of the pot size
        let socket = manager.defaultSocket
        socket.connect()
        socket.emit("Created Game", settings)
    }
    
}

struct ContentView: View {
    @ObservedObject var service = Service()
    var body: some View {
        if (homeScreen){
            //have a view for the homescreen
            VStack {
                /*
                Button{
                    //create game button
                    //this will transfer to the create game screen
                    //this will set the homescreen variable to false and createGamescreen to true
                }
                 */
                
                /*
                Button{
                    //join game button
                    //this will transfer screens to the join game screen
                    //will set homescreen variable to false and joingamescreen to true
                }
                 */
                Button("Create Game"){
                    homeScreen = false
                    createGameScreen = true
                }
                Button("Join Game"){
                    homeScreen = false
                    joinGameScreen = true
                }
                
                
                
                Spacer()
            }
        }
        else if (createGameScreen){
            VStack {
                //This will have the create game settings screen
                //therefore will have pot size and such
                //not sure if we want sliders or how we want this done
                //to send data to the server I have to call a function
                
                
                Spacer()
            }
        }
        else if (gameScreen){
            if (firstRound){
                if (playerTurn){
                    //show the gamescreen with buttons available for pushing
                    VStack {
                        var dic = [String: String]()
                        //most likely will not be a button
                        Button("Bet"){
                            
                            dic["Bet"] = "Bet amount"
                            service.sendPlayerTurn(turn: dic)
                            playerTurn = false
                        }
                    }
                }
                else{
                    //should show the gamescreen but without greyed out buttons that do not work
                    
                }
            }
            else{
                //round is not zero and should show all of the buttons
                if (playerTurn){
                    //should show all of the buttons available and able to be pushed
                    VStack {
                        var dic = [String: String]()
                        Button("Fold"){
                            //doesn't matter what the value of fold is
                            dic["Fold"] = " "
                            service.sendPlayerTurn(turn: dic)
                            playerTurn = false
                        }
                        //most likely will not be a button
                        Button("Bet"){
                            
                            dic["Bet"] = "Bet amount"
                            service.sendPlayerTurn(turn: dic)
                            playerTurn = false
                        }
                    }
                }
                else{
                    //should show the available buttons but greyed out and should not be able to press the buttons
                    VStack {
                        var dic = [String: String]()
                        /*
                         Buttons here should be greyed out because it is not users turn and it is not round 0
                         
                        Button("Fold"){
                            //doesn't matter what the value of fold is
                            //
                        }
                        //most likely will not be a button
                        Button("Bet"){
                            
                        }
                         */
                    }
                }
            }
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
