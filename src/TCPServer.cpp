#include "TCPServer.h"
#include "ClientSession.h"
#include <iostream>
#include <stdexcept>
#include <cstring>
#include <unistd.h>
#include <thread>

using namespace std;

TCPServer::TCPServer(int port) : _port(port), _server_socket(0) {
}

void TCPServer::start() {
    // --- Step 1: Create Socket ---
    _server_socket = socket(AF_INET, SOCK_STREAM, 0);
    if (_server_socket < 0) {
        throw runtime_error("Error creating socket");
    }

    // --- Step 2: Bind ---
    struct sockaddr_in server_addr;
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY; // Listens to all IP's
    server_addr.sin_port = htons(_port);

    // Binds socket
    if (bind(_server_socket, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        throw runtime_error("Error binding socket");
    }

    // --- Step 3: Listen ---
    if (listen(_server_socket, 5) < 0) {
        throw runtime_error("Error listening to socket");
    }

    cout << "Server is listening on port " << _port << "..." << endl;

    // Main Accept Loop
    while (true) {
        struct sockaddr_in client_addr;
        socklen_t client_len = sizeof(client_addr);

        // Awaits new client (Blocked)
        int client_socket = accept(_server_socket, (struct sockaddr*)&client_addr, &client_len);
        
        if (client_socket < 0) {
            perror("Error accepting client");
            continue;
        }

        cout << "New client connected! Socket ID: " << client_socket << endl;

        // Using lambda function we create a new thread for client session
        std::thread clientThread([client_socket] () {
            ClientSession session(client_socket);
            session.run();
        });

        // Release the Thread to run independently (Detach)
        clientThread.detach();
    }
}

TCPServer::~TCPServer() {
    if (_server_socket > 0) {
        cout << "Closing server socket..." << endl;
        close(_server_socket);
    }
}