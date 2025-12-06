#include "ClientSession.h"
#include "App.h"
#include "FileManager.h"
#include "SocketIOHandler.h"
#include <iostream>
#include <string>

ClientSession::ClientSession(int clientSocket , FileManager& sharedFile) : _clientSocket(clientSocket) , m_fm(sharedFile) {
}

void ClientSession::run() {
    try {
        // Creates the I/O base on the socket
        SocketIOHandler io(_clientSocket);
        
        
        // Creates App and connects it to socket
        App app(&io, m_fm);
        
        // Logical function based on clients connection
        app.run();
        
    } catch (const std::exception& e) {
        std::cerr << "Error in client session (Socket " << _clientSocket << "): " << e.what() << std::endl;
    }
    
    // In client's disconnection the App will automatically close the socket
    std::cout << "Client DISCONNECTED. Session terminated cleanly on socket ID: " << _clientSocket << std::endl;
}