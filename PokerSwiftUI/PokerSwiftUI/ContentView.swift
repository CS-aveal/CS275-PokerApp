//
//  ContentView.swift
//  PokerSwiftUI
//
//  Created by Matthew McCarthy on 10/19/22.
//

import SwiftUI

struct ContentView: View {
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
                        Text("Player 2")
                        
                        HStack{ // Two Cards
                            Image("backOfCard")
                            Image("backOfCard")
                            
                        }
                        
                        Text("(Chip Count)")
                    }
                    
                    Spacer()
                    
                    VStack { // Player 3
                        Text("Player 3")
                        
                        HStack{ // Two Cards
                            Image("backOfCard")
                            Image("backOfCard")
                        }
                        
                        Text("(Chip Count)")
                    }
                    
                    Spacer()
                
                }
                
                Spacer()
                
                HStack { // Two Players and Pot Value

                    VStack { // Player 1
                        Text("Player 1")
                        
                        HStack{ // Two Cards
                            Image("backOfCard")
                            Image("backOfCard")
                        }
                        
                        Text("(Chip Count)")
                        
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
                        
                        Text("(POT VALUE)")
                            .font(.system(size: 30, weight: .bold, design: .monospaced))
                        
                    }
                    .padding(.top, 25)
                    
                    Spacer()
                    
                    VStack { // Player 4
                        
                    
                        
                        Text("Player 4")
                        
                        HStack{ // Two Cards
                            Image("backOfCard")
                            Image("backOfCard")
                        }
                        
                        Text("(Chip Count)")
                        
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
    
} // ContentView

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
            .previewInterfaceOrientation(.landscapeLeft)

    }
}
