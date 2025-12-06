#ifndef TCPSERVER_H
#define TCPSERVER_H

#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include "FileManager.h"
#include "RLECompressor.h"

class TCPServer
{
private:
    int _port;
    int _server_socket;

    RLECompressor m_compressor;
    FileManager m_fm;

public:
    // Constructor for port
    TCPServer(int port);

    // Destructor for closing the scoket
    ~TCPServer();

    // For binding and listening
    void start();
};

#endif