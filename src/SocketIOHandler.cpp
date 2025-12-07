#include "SocketIOHandler.h"
#include <sys/socket.h>
#include <iostream>
#include <vector>

using namespace std;

// Send a single line to the client socket (always terminated with '\n').
void SocketIOHandler::write(const string& data) {
    string message = data + "\n";
    ssize_t sent_bytes = send(_client_socket, message.c_str(), message.size(), 0);

    if (sent_bytes < 0) {
        perror("SocketIOHandler: Error sending data");
    }
}

// Read a single line from the client socket (until '\n', ignoring '\r').
string SocketIOHandler::read() {
    string result;
    char c;

    while (true) {
        ssize_t bytes = recv(_client_socket, &c, 1, 0);

        if (bytes < 0) {
            perror("SocketIOHandler: Error reading data");
            return "";
        }

        if (bytes == 0) {
            // Client closed the connection.
            return "";
        }

        if (c == '\n') {
            break;
        }

        if (c != '\r') {
            result += c;
        }
    }

    return result;
}
