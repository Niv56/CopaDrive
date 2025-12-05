#ifndef SOCKETIOHANDLER_H
#define SOCKETIOHANDLER_H

#include "IIOHandler.h"
#include <unistd.h>

class SocketIOHandler : public IIOHandler {
private:
    int _client_socket;

public:
    // Constructor gets the socket
    SocketIOHandler(int socket) : _client_socket(socket) {}

    // Destructor closes socket
    ~SocketIOHandler() override {
        if (_client_socket > 0) {
            close(_client_socket);
        }
    }

    // IO implemantaion
    std::string read() override;
    void write(const std::string& data) override;
};

#endif