#include <gtest/gtest.h>
#include <thread>
#include <vector>
#include <string>
#include <chrono>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>
#include "TCPServer.h" 

// Basic stress-test configuration for the multi-threaded server
const std::string STRESS_SERVER_IP   = "127.0.0.1";
const int         STRESS_SERVER_PORT = 5555;
const int         NUM_STRESS_CLIENTS = 10;   // number of parallel clients
const int         COMMANDS_PER_CLIENT = 50;  // number of commands per client

// Single client routine: opens a socket, connects, and sends many post commands
void run_stress_client(int id) {
    int sock = socket(AF_INET, SOCK_STREAM, 0);
    ASSERT_GE(sock, 0) << "Client " << id << ": Failed to create socket";

    struct sockaddr_in serv_addr;
    serv_addr.sin_family = AF_INET;
    serv_addr.sin_port   = htons(STRESS_SERVER_PORT);
    inet_pton(AF_INET, STRESS_SERVER_IP.c_str(), &serv_addr.sin_addr);

    // Try to connect a few times in case the server is still starting up
    int retries = 5;
    while (connect(sock, (struct sockaddr *)&serv_addr, sizeof(serv_addr)) < 0) {
        if (--retries == 0) {
            close(sock);
            FAIL() << "Client " << id << ": Failed to connect to server after retries";
            return;
        }
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }

    char buffer[1024] = {0};
    std::string filename = "stress_file_" + std::to_string(id) + ".txt";

    // Send many post commands on the same connection and verify the server stays responsive
    for (int i = 0; i < COMMANDS_PER_CLIENT; ++i) {
        std::string content = "Content_" + std::to_string(id) + "_" + std::to_string(i);
        std::string cmd     = "post " + filename + " " + content + "\n";

        send(sock, cmd.c_str(), cmd.length(), 0);

        // Read server response to confirm the connection is still alive
        int valread = read(sock, buffer, 1024);
        EXPECT_GT(valread, 0) << "Client " << id
                              << ": Server closed connection unexpectedly at iter " << i;
    }

    close(sock);
}

// Full stress test: run the real TCPServer and hit it with many concurrent clients
TEST(StressTest, ShouldHandleConcurrentClientsWithoutCrashing) {
    // Start the server on a background thread
    std::thread serverThread([]() {
        try {
            TCPServer server(STRESS_SERVER_PORT);
            server.start();
        } catch (const std::exception& e) {
            std::cerr << "StressTest Server Error: " << e.what() << std::endl;
        }
    });

    // Small delay so the server can start listening
    std::this_thread::sleep_for(std::chrono::milliseconds(200));

    // Launch multiple clients in parallel
    std::vector<std::thread> clients;
    for (int i = 0; i < NUM_STRESS_CLIENTS; ++i) {
        clients.emplace_back(run_stress_client, i);
    }

    // Wait for all clients to finish
    for (auto& t : clients) {
        if (t.joinable()) {
            t.join();
        }
    }

    // We detach the server thread here; process termination will end it
    serverThread.detach();
}
