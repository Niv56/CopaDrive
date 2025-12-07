#include "TCPServer.h"
#include "ClientSession.h"
#include "RLECompressor.h"
#include "FileManager.h"
#include <iostream>
#include <stdexcept>
#include <cstring>
#include <unistd.h>
#include <thread>

using namespace std;

// TCP server that listens on a port and spawns a thread per client.
TCPServer::TCPServer(int port) 
: _port(port), 
  _server_socket(0), 
  m_compressor(), 
  m_fm(m_compressor) {
}

void TCPServer::start() {
    // 1. Create listening socket.
    _server_socket = socket(AF_INET, SOCK_STREAM, 0);
    if (_server_socket < 0) {
        throw runtime_error("Error creating socket");
    }

    // 2. Bind to all interfaces on the configured port.
    struct sockaddr_in server_addr;
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family      = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;
    server_addr.sin_port        = htons(_port);

    if (bind(_server_socket, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        throw runtime_error("Error binding socket");
    }

    // 3. Start listening for incoming connections.
    if (listen(_server_socket, 5) < 0) {
        throw runtime_error("Error listening to socket");
    }

    cout << "Server is listening on port " << _port << "..." << endl;

    // 4. Accept loop: each client handled in its own thread.
    while (true) {
        struct sockaddr_in client_addr;
        socklen_t client_len = sizeof(client_addr);

        int client_socket = accept(_server_socket, (struct sockaddr*)&client_addr, &client_len);
        
        if (client_socket < 0) {
            perror("Error accepting client");
            continue;
        }

        cout << "New client connected! Socket ID: " << client_socket << endl;

        std::thread clientThread([client_socket, this]() {
            ClientSession session(client_socket, this->m_fm);
            session.run();
        });

        clientThread.detach();
    }
}

TCPServer::~TCPServer() {
    if (_server_socket > 0) {
        cout << "Closing server socket..." << endl;
        close(_server_socket);
    }
}
