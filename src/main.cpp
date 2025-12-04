#include "TCPServer.h"
#include "ServerConfig.h"
#include <iostream>

int main(int argc, char* argv[]) {
    if (argc != 2) {
        std::cerr << "Usage: " << argv[0] << " <port>" << std::endl;
        return 1;
    }

    try {
        // שימוש בפונקציה החדשה שבדקנו בטסטים
        int port = ServerUtils::parsePort(argv[1]);

        TCPServer server(port);
        server.start();
    } 
    catch (const std::exception& e) {
        // זה תופס גם שגיאות פורט (מהפונקציה) וגם שגיאות סוקט (מהשרת)
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }

    return 0;
}