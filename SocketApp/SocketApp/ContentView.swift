//
//  ContentView.swift
//  SocketApp
//
//  Created by Austin Veal on 10/17/22.
//

import SwiftUI
import SocketIO

final class Service: ObservableObject {
    private var manager = SocketManager(socketURL: URL(string: "ws://localhost:3000")!, config: [.log(true), .compress])
    
    @Published var messages = [String]()
    
    init() {
        let socket = manager.defaultSocket
        socket.on(clientEvent: .connect) { (data, ack) in
            print("Connected")
            socket.emit("NodeJS Server Port", "Hi node.js server!")
        }
        
        socket.on("iOS Client Port") { [weak self] (data, ack) in
            if let data = data[0] as? [String: String],
               let rawMessage = data["msg"]{
                DispatchQueue.main.async {
                    self?.messages.append(rawMessage)
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
            ForEach(service.messages, id: \.self) { msg in
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
