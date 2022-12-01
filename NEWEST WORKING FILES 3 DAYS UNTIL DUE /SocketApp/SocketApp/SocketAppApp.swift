//
//  PokerSwiftUIApp.swift
//  PokerSwiftUI
//
//  Created by Matthew McCarthy on 10/19/22.
//

import SwiftUI

@main
struct SocketAppApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(DiffScreens())
                .environmentObject(Observables())
                
        }
    }
}
