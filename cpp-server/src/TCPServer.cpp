#include "TCPServer.h"
#include "ClientSession.h"
#include <iostream>
#include <stdexcept>
#include <cstring>
#include <unistd.h>
#include <thread>
#include <algorithm>
#include <cerrno>

static size_t defaultWorkerCount() {
    unsigned int hc = std::thread::hardware_concurrency();
    if (hc == 0) hc = 1;
    return std::max<size_t>(1, static_cast<size_t>(hc));
}

TCPServer::TCPServer(int port)
    : _port(port),
      _server_socket(-1),
      m_compressor(),
      m_fm(m_compressor),
      m_pool(defaultWorkerCount()) {
}

void TCPServer::start() {
    m_running.store(true);

    _server_socket = ::socket(AF_INET, SOCK_STREAM, 0);
    if (_server_socket < 0) {
        m_running.store(false);
        throw std::runtime_error("Error creating socket");
    }

    int opt = 1;
    ::setsockopt(_server_socket, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    sockaddr_in server_addr{};
    std::memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family      = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;
    server_addr.sin_port        = htons(_port);

    if (::bind(_server_socket, (sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        stop();
        throw std::runtime_error("Error binding socket");
    }

    if (::listen(_server_socket, 5) < 0) {
        stop();
        throw std::runtime_error("Error listening to socket");
    }

    std::cout << "Server is listening on port " << _port << "..." << std::endl;

    while (m_running.load()) {
        sockaddr_in client_addr{};
        socklen_t client_len = sizeof(client_addr);

        int client_socket = ::accept(_server_socket, (sockaddr*)&client_addr, &client_len);

        if (client_socket < 0) {
            if (!m_running.load()) break;
            if (errno == EINTR) continue;
            perror("Error accepting client");
            continue;
        }

        std::cout << "New client connected! Socket ID: " << client_socket << std::endl;

        try {
            m_pool.enqueue([this, client_socket]() {
                ClientSession session(client_socket, this->m_fm);
                session.run();
            });
        } catch (...) {
            ::shutdown(client_socket, SHUT_RDWR);
            ::close(client_socket);
        }
    }

    stop();
}

void TCPServer::stop() {
    m_running.store(false);

    if (_server_socket >= 0) {
        ::shutdown(_server_socket, SHUT_RDWR);
        ::close(_server_socket);
        _server_socket = -1;
    }

    m_pool.shutdown();
}

TCPServer::~TCPServer() {
    stop();
}
