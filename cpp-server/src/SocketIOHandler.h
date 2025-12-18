#ifndef SOCKETIOHANDLER_H
#define SOCKETIOHANDLER_H
#include "IIOHandler.h"
#include <unistd.h>

// I/O adapter that reads/writes lines over a TCP socket.
class SocketIOHandler : public IIOHandler {
private:
    int _client_socket;

public:
    // Wrap an existing client socket FD.
    SocketIOHandler(int socket) : _client_socket(socket) {}

    // Close the socket when the handler is destroyed.
    ~SocketIOHandler() override {
        if (_client_socket > 0) {
            close(_client_socket);
        }
    }

    // Read a single line from the socket.
    std::string read() override;

    // Write a single line to the socket.
    void write(const std::string& data) override;
};

#endif
