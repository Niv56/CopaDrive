#ifndef TCPSERVER_H
#define TCPSERVER_H
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include "FileManager.h"
#include "RLECompressor.h"

// Single TCP server that owns the shared FileManager and RLE compressor.
class TCPServer
{
private:
    int _port;
    int _server_socket;
    // Concrete compressor used by all clients.
    RLECompressor m_compressor;
    // Shared storage manager (thread-safe).
    FileManager   m_fm;       

public:
    // Initialize a server that will listen on the given port.
    TCPServer(int port);

    // Close the listening socket on shutdown.
    ~TCPServer();

    // Create, bind, listen and accept clients (spawn thread per client).
    void start();
};

#endif
