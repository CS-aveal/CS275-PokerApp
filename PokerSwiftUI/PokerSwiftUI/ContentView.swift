//
//  ContentView.swift
//  PokerSwiftUI
//
//  Created by Matthew McCarthy on 10/19/22.
//

import SwiftUI

class DiffScreens: ObservableObject {
    
    @Published var home: Bool = false
    @Published var createGame: Bool = false
    @Published var joinGame: Bool = false
    @Published var inGame: Bool = true
    
    
}

struct ContentView: View {
    
    @ObservedObject var screens: DiffScreens = DiffScreens()
    
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

struct createGameView: View {
    
    @ObservedObject var screens: DiffScreens = DiffScreens()
    
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

struct AppHome: View {
    
    @ObservedObject var screens: DiffScreens = DiffScreens()
    
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
                                screens.home = false
                                screens.joinGame = true
                                
                                
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

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .previewInterfaceOrientation(.landscapeLeft)

    }
}

