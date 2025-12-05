#include "ClientSession.h"
#include "App.h"
#include "RLECompressor.h"
#include "SocketIOHandler.h"
#include <iostream>
#include <string>

ClientSession::ClientSession(int clientSocket) : _clientSocket(clientSocket) {
}

void ClientSession::run() {
    try {
        // Creates the I/O base on the socket
        SocketIOHandler io(_clientSocket);
        
        // Creates compressor for client
        RLECompressor compressor;
        
        // Creates App and connects it to socket
        App app(&compressor, &io);
        
        // Logical function based on clients connection
        app.run();
        
    } catch (const std::exception& e) {
        std::cerr << "Error in client session (Socket " << _clientSocket << "): " << e.what() << std::endl;
    }
    
    // In client's disconnection the App will automatically close the socket
    std::cout << "Client DISCONNECTED. Session terminated cleanly on socket ID: " << _clientSocket << std::endl;
}