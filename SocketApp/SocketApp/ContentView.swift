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

final class Service: ObservableObject {
    private var manager = SocketManager(socketURL: URL(string: "ws://localhost:3000")!, config: [.log(true), .compress])
    
    @Published var stringMessages = [String]()
    @Published var stringArrayMessages = [[String]]()
    @Published var intMessages = [Int]()
    @Published var intArrayMessages = [[Int]]()
    @Published var messages = [formattedData]()
    
    init() {
        let socket = manager.defaultSocket
        socket.on(clientEvent: .connect) { (data, ack) in
            print("Connected")
            
            /*
             Sending messages to the server at port "NodeJS Server Port"
             */
            
            socket.emit("NodeJS Server Port", "Hi node.js server!")
            socket.emit("Create Game", "New Poker Game")
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
            if let data = data[0] as? [String: [String]],
               let rawmessage = data["msg"]{
                DispatchQueue.main.async {
                    var newData = formattedData()
                    newData.arrS = rawmessage
                    self?.messages.append(newData)
                }
            }
        }
        socket.connect()
    }
}

struct ContentView: View {
    @ObservedObject var service = Service()
    var body: some View {
        VStack {
            Text("Recieved Messages from Node.js: ")
            
            ForEach(service.stringMessages, id: \.self) { msg in
                Text(msg).padding()
            }
            Spacer()
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
