#include <iostream>     // console input/output
#include <string>       // std::string
#include <cstring>      // std::memset

// Networking (POSIX sockets)
#include <sys/socket.h> // socket(), send(), recv()
#include <netinet/in.h> // sockaddr_in, htons()
#include <arpa/inet.h>  // inet_pton()
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
    // Validate args: expect <ip> <port>
    if (argc != 3) return 1;

    std::string serverIp = argv[1];
    int port = 0;

    // Parse port
    try { port = std::stoi(argv[2]); }
    catch (...) { return 1; }
    if (port < 1 || port > 65535) return 1;

    // Create TCP socket
    int sock = ::socket(AF_INET, SOCK_STREAM, 0);
    if (sock < 0) return 1;

    // Prepare server address
    sockaddr_in serverAddr{};
    std::memset(&serverAddr, 0, sizeof(serverAddr));
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_port = htons(port);

    if (::inet_pton(AF_INET, serverIp.c_str(), &serverAddr.sin_addr) <= 0) {
        ::close(sock);
        return 1;
    }

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

        std::string response;
        if (!recvLine(sock, response)) break;

        // Client prints ONLY server output
        std::cout << response << std::endl;
    }

    ::close(sock);
    return 0;
}
