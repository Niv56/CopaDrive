#include "TCPServer.h"
#include <iostream>
#include <stdexcept>
#include <cstring>
#include <unistd.h>

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

    cout << "Server initialized successfully. Listening on port " << _port << endl;
}

TCPServer::~TCPServer() {
    if (_server_socket > 0) {
        cout << "Closing server socket..." << endl;
        close(_server_socket);
    }
}