#include <gtest/gtest.h>
#include <thread>
#include <vector>
#include <string>
#include <atomic>
#include <chrono>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <filesystem>
#include <cstdlib>
#include "TCPServer.h"

static const std::string TEST_IP = "127.0.0.1";
static const int TEST_PORT = 6666;
static const std::string SHARED_FILENAME = "race_condition_test.txt";

static std::atomic<int> successful_creations{0};
static std::atomic<int> rejected_requests{0};

static void run_concurrent_client(int id) {
    int sock = ::socket(AF_INET, SOCK_STREAM, 0);
    if (sock < 0) { rejected_requests++; return; }

    sockaddr_in serv_addr{};
    serv_addr.sin_family = AF_INET;
    serv_addr.sin_port = htons(TEST_PORT);
    if (::inet_pton(AF_INET, TEST_IP.c_str(), &serv_addr.sin_addr) != 1) {
        rejected_requests++;
        ::close(sock);
        return;
    }

    if (::connect(sock, (struct sockaddr*)&serv_addr, sizeof(serv_addr)) < 0) {
        rejected_requests++;
        ::close(sock);
        return;
    }

    std::string content = "Content_from_client_" + std::to_string(id);
    std::string cmd = "post " + SHARED_FILENAME + " " + content + "\n";

    ssize_t sent = ::send(sock, cmd.c_str(), cmd.size(), 0);
    if (sent <= 0) {
        rejected_requests++;
        ::close(sock);
        return;
    }

    char buffer[1024] = {0};
    int valread = (int)::read(sock, buffer, 1023);
    if (valread <= 0) {
        rejected_requests++;
        ::close(sock);
        return;
    }

    std::string response(buffer, (size_t)valread);
    if (response.find("201") != std::string::npos) {
        successful_creations++;
    } else {
        rejected_requests++;
    }

    ::close(sock);
}

TEST(MutexIntegrityTest, OnlyOneClientShouldSucceedInCreatingSharedFile) {
    successful_creations.store(0);
    rejected_requests.store(0);

    const char* envPath = std::getenv("PATH_DIR");
    std::filesystem::path storageDir = (envPath && *envPath) ? envPath : ".";
    std::filesystem::path fullPath = storageDir / SHARED_FILENAME;

    if (std::filesystem::exists(fullPath)) {
        std::filesystem::remove(fullPath);
    }
    if (std::filesystem::exists(SHARED_FILENAME)) {
        std::filesystem::remove(SHARED_FILENAME);
    }

    std::thread serverThread([]() {
        try {
            TCPServer server(TEST_PORT);
            server.start();
        } catch (...) {
        }
    });

    std::this_thread::sleep_for(std::chrono::milliseconds(200));

    const int TOTAL_CLIENTS = 20;
    std::vector<std::thread> clients;
    clients.reserve(TOTAL_CLIENTS);

    for (int i = 0; i < TOTAL_CLIENTS; ++i) {
        clients.emplace_back(run_concurrent_client, i);
    }

    for (auto& t : clients) {
        t.join();
    }

    EXPECT_EQ(successful_creations.load(), 1)
        << "Race condition detected: more than one client managed to create the same file.";

    EXPECT_EQ(rejected_requests.load(), TOTAL_CLIENTS - 1)
        << "Not all rejected clients received an error response as expected.";

    serverThread.detach();
}
