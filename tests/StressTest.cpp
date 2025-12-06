#include <gtest/gtest.h>
#include <thread>
#include <vector>
#include <string>
#include <chrono>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>
#include "TCPServer.h" 

// Test settings
const std::string STRESS_SERVER_IP = "127.0.0.1";
const int STRESS_SERVER_PORT = 5555;
const int NUM_STRESS_CLIENTS = 10;       // 10 clients
const int COMMANDS_PER_CLIENT = 50;      // Flood 50 commands per client

// Client functionallity
void run_stress_client(int id) {
    int sock = socket(AF_INET, SOCK_STREAM, 0);
    ASSERT_GE(sock, 0) << "Client " << id << ": Failed to create socket";

    struct sockaddr_in serv_addr;
    serv_addr.sin_family = AF_INET;
    serv_addr.sin_port = htons(STRESS_SERVER_PORT);
    inet_pton(AF_INET, STRESS_SERVER_IP.c_str(), &serv_addr.sin_addr);

    // Retries for client connection in case server still down
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

    for (int i = 0; i < COMMANDS_PER_CLIENT; ++i) {
        // POST creation
        std::string content = "Content_" + std::to_string(id) + "_" + std::to_string(i);
        std::string cmd = "post " + filename + " " + content + "\n";

        send(sock, cmd.c_str(), cmd.length(), 0);

        // Server connectivity check
        int valread = read(sock, buffer, 1024);
        EXPECT_GT(valread, 0) << "Client " << id << ": Server closed connection unexpectedly at iter " << i;
    }

    close(sock);
}

// Stress test init
TEST(StressTest, ShouldHandleConcurrentClientsWithoutCrashing) {
    // Server up with port 5555
    // We try catch in case other tset collide with that port (They shouldn't)
    std::thread serverThread([]() {
        try {
            TCPServer server(STRESS_SERVER_PORT);
            server.start(); 
        } catch (const std::exception& e) {
            std::cerr << "StressTest Server Error: " << e.what() << std::endl;
        }
    });

    // Listen!!!
    std::this_thread::sleep_for(std::chrono::milliseconds(200));

    // Flood
    std::vector<std::thread> clients;
    for (int i = 0; i < NUM_STRESS_CLIENTS; ++i) {
        clients.emplace_back(run_stress_client, i);
    }

    // Waiting for all clients to finish, it will take some time
    for (auto& t : clients) {
        if (t.joinable()) {
            t.join();
        }
    }

    // Kills the server
    serverThread.detach();
}