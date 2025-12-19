#include "TCPServer.h"
#include "ServerConfig.h"
#include <iostream>

// Entry point for the TCP server process.
int main(int argc, char* argv[]) {
    if (argc != 2) {
        std::cerr << "Usage: " << argv[0] << " <port>" << std::endl;
        return 1;
    }

    try {
        // Parse and validate the listening port.
        int port = ServerUtils::parsePort(argv[1]);

        // Create the server and start accepting clients.
        TCPServer server(port);
        server.start();
    } 
    catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }

    return 0;
}
