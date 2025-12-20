#include "ClientSession.h"
#include "App.h"
#include "FileManager.h"
#include "SocketIOHandler.h"

#include <iostream>
#include <string>
#include <unistd.h>
#include <sys/socket.h>

ClientSession::ClientSession(int clientSocket, FileManager& sharedFile)
    : _clientSocket(clientSocket),
      m_fm(sharedFile) {
}

void ClientSession::run() {
    try {
        SocketIOHandler io(_clientSocket);
        App app(&io, m_fm);
        app.run();
    } catch (const std::exception& e) {
        std::cerr << "Client session error (socket " << _clientSocket << "): "
                  << e.what() << std::endl;
    } catch (...) {
        std::cerr << "Client session error (socket " << _clientSocket << "): unknown exception"
                  << std::endl;
    }

    if (_clientSocket >= 0) {
        ::shutdown(_clientSocket, SHUT_RDWR);
        ::close(_clientSocket);
        _clientSocket = -1;
    }

    std::cout << "Client disconnected. Session closed." << std::endl;
}
