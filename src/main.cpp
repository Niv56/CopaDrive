#include "TCPServer.h"
#include "ServerConfig.h"
#include <iostream>

int main(int argc, char* argv[]) {
    if (argc != 2) {
        std::cerr << "Usage: " << argv[0] << " <port>" << std::endl;
        return 1;
    }

    try {
        // Port validation
        int port = ServerUtils::parsePort(argv[1]);

        TCPServer server(port);
        server.start();
    } 
    catch (const std::exception& e) {
        // Handles port and socket exceptions
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }

    return 0;
}