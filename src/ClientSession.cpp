#include "ClientSession.h"
#include "App.h"
#include "FileManager.h"
#include "SocketIOHandler.h"
#include <iostream>
#include <string>

// Represents a single connected client, sharing the common FileManager.
ClientSession::ClientSession(int clientSocket, FileManager& sharedFile)
    : _clientSocket(clientSocket),
      m_fm(sharedFile) {
}

// Entry point for the per-client thread: wrap the socket with IO and run the App.
void ClientSession::run() {
    try {
        SocketIOHandler io(_clientSocket);
        App app(&io, m_fm);
        app.run();
    } catch (const std::exception& e) {
        std::cerr << "Error in client session (Socket "
                  << _clientSocket << "): " << e.what() << std::endl;
    }

    std::cout << "Client DISCONNECTED. Session terminated cleanly on socket ID: "
              << _clientSocket << std::endl;
}
