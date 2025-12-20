#ifndef TCPSERVER_H
#define TCPSERVER_H

#include <atomic>
#include <netinet/in.h>
#include <sys/socket.h>
#include <unistd.h>

#include "FileManager.h"
#include "RLECompressor.h"
#include "ThreadPool.h"

class TCPServer {
private:
    int _port;
    int _server_socket = -1;

    RLECompressor m_compressor;
    FileManager   m_fm;

    ThreadPool m_pool;
    std::atomic<bool> m_running{false};

public:
    explicit TCPServer(int port);
    ~TCPServer();

    void start();
    void stop();
};

#endif
