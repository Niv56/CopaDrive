#ifndef TCPSERVER_H
#define TCPSERVER_H

#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>

class TCPServer {
private:
    int _port;
    int _server_socket;

public:
    // Constructor for port
    TCPServer(int port);
    
    // For binding and listening
    void start();

    // Destructor for closing the scoket
    ~TCPServer();
};

#endif