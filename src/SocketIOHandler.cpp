#include "SocketIOHandler.h"
#include <sys/socket.h>
#include <iostream>
#include <vector>

using namespace std;

void SocketIOHandler::write(const string& data) {
    // Append newline character according to the defined protocol
    string message = data + "\n";
    
    // Send via the socket
    ssize_t sent_bytes = send(_client_socket, message.c_str(), message.size(), 0);
    
    if (sent_bytes < 0) {
        perror("SocketIOHandler: Error sending data");
    }
}

string SocketIOHandler::read() {
    string result;
    char c;
    
    // Loop to read byte-by-byte until a newline is reached
    // (Simulates std::getline behavior over a socket)
    while (true) {
        ssize_t bytes = recv(_client_socket, &c, 1, 0);
        
        if (bytes < 0) {
            perror("SocketIOHandler: Error reading data");
            return "";
        }
        
        if (bytes == 0) {
            // The client closed the connection
            return ""; 
        }

        if (c == '\n') {
            // End of command (Protocol requires newline at the end)
            break;
        }
        
        // Filter control characters if necessary (like \r)
        if (c != '\r') {
            result += c;
        }
    }
    
    return result;
}