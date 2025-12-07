#include <iostream>
#include <string>
#include <cstring>

// Networking
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <netdb.h>      // getaddrinfo, freeaddrinfo
#include <unistd.h>     // close()

// Send entire buffer over TCP
static bool sendAll(int sock, const std::string& data) {
    const char* buf = data.c_str();
    size_t total = 0;
    size_t len = data.size();

    while (total < len) {
        ssize_t sent = ::send(sock, buf + total, len - total, 0);
        if (sent <= 0) return false;
        total += (size_t)sent;
    }
    return true;
}

// Receive a single line (until '\n'), ignoring '\r'
static bool recvLine(int sock, std::string& out) {
    out.clear();
    char c;

    while (true) {
        ssize_t n = ::recv(sock, &c, 1, 0);
        if (n <= 0) return false;
        if (c == '\n') break;
        if (c != '\r') out.push_back(c);
    }
    return true;
}

int main(int argc, char* argv[]) {
    // Expect: <host> <port>   e.g.  "server 5555"
    if (argc != 3) {
        return 1;
    }

    std::string serverHost = argv[1];
    int port = 0;

    try {
        port = std::stoi(argv[2]);
    } catch (...) {
        return 1;
    }
    if (port < 1 || port > 65535) return 1;

    // Create TCP socket
    int sock = ::socket(AF_INET, SOCK_STREAM, 0);
    if (sock < 0) return 1;

    // Resolve hostname (e.g. "server") to IPv4 address
    struct addrinfo hints{};
    std::memset(&hints, 0, sizeof(hints));
    hints.ai_family   = AF_INET;      // IPv4
    hints.ai_socktype = SOCK_STREAM;  // TCP

    struct addrinfo* res = nullptr;
    int rc = ::getaddrinfo(serverHost.c_str(), nullptr, &hints, &res);
    if (rc != 0 || !res) {
        ::close(sock);
        return 1;
    }

    sockaddr_in serverAddr{};
    std::memcpy(&serverAddr, res->ai_addr, sizeof(sockaddr_in));
    serverAddr.sin_port = htons(port);

    ::freeaddrinfo(res);

    // Connect to server
    if (::connect(sock, (sockaddr*)&serverAddr, sizeof(serverAddr)) < 0) {
        ::close(sock);
        return 1;
    }

    // Main loop: read → send → receive → print
    while (true) {
        std::string line;
        if (!std::getline(std::cin, line)) break;

        // Exit command (local only)
        if (line == "exit" || line == "quit") break;

        line.push_back('\n');

        if (!sendAll(sock, line)) break;

        // 1. Read status line (e.g. "200 Ok", "201 Created", "404 Not Found")
        std::string statusLine;
        if (!recvLine(sock, statusLine)) break;

        std::cout << statusLine << std::endl;

     
        if (statusLine.rfind("200 ", 0) != 0) {
            continue;
        }

        // 2. Read blank line (separator)
        std::string blank;
        if (!recvLine(sock, blank)) break;

  
        std::cout << std::endl;

        while (true) {
            std::string bodyLine;
            if (!recvLine(sock, bodyLine)) {
           
                goto end;
            }
            if (bodyLine.empty()) {
               
                break;
            }
            std::cout << bodyLine << std::endl;
        }
    }
end:
    ;


    ::close(sock);
    return 0;
}
