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
#include "TCPServer.h"

// הגדרות לבדיקת מרוץ סמכויות
const std::string TEST_IP = "127.0.0.1";
const int TEST_PORT = 6666;
const std::string SHARED_FILENAME = "race_condition_test.txt";

// מונים אטומיים למעקב אחר תגובות השרת
std::atomic<int> successful_creations{0};
std::atomic<int> rejected_requests{0};

void run_concurrent_client(int id) {
    int sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock < 0) return;

    struct sockaddr_in serv_addr;
    serv_addr.sin_family = AF_INET;
    serv_addr.sin_port = htons(TEST_PORT);
    inet_pton(AF_INET, TEST_IP.c_str(), &serv_addr.sin_addr);

    // ניסיון התחברות
    if (connect(sock, (struct sockaddr *)&serv_addr, sizeof(serv_addr)) < 0) {
        close(sock);
        return;
    }

    // כל הלקוחות מנסים לכתוב לאותו קובץ בדיוק
    std::string content = "Content_from_client_" + std::to_string(id);
    std::string cmd = "post " + SHARED_FILENAME + " " + content + "\n";
    send(sock, cmd.c_str(), cmd.length(), 0);

    char buffer[1024] = {0};
    int valread = read(sock, buffer, 1024);
    if (valread > 0) {
        std::string response(buffer);
        // בדיקה אם השרת החזיר "201 Created" [cite: 52]
        if (response.find("201") != std::string::npos) {
            successful_creations++;
        } else {
            rejected_requests++;
        }
    }

    close(sock);
}

TEST(MutexIntegrityTest, OnlyOneClientShouldSucceedInCreatingSharedFile) {
    // 1. הכנת הסביבה - מחיקת הקובץ אם הוא קיים
    if (std::filesystem::exists(SHARED_FILENAME)) {
        std::filesystem::remove(SHARED_FILENAME);
    }

    // 2. הפעלת השרת ב-Thread נפרד [cite: 28, 43]
    std::thread serverThread([]() {
        try {
            TCPServer server(TEST_PORT);
            server.start();
        } catch (...) {}
    });

    // המתנה קלה לעליית השרת
    std::this_thread::sleep_for(std::chrono::milliseconds(200));

    // 3. הרצת 20 לקוחות בו-זמנית שמנסים "להתנפל" על אותו קובץ
    const int TOTAL_CLIENTS = 20;
    std::vector<std::thread> clients;
    for (int i = 0; i < TOTAL_CLIENTS; ++i) {
        clients.emplace_back(run_concurrent_client, i);
    }

    for (auto& t : clients) t.join();

    // 4. אימות התוצאות
    // אם המיוטקס עובד: רק לקוח אחד בדיוק הצליח ליצור (201) והשאר נדחו.
    // אם המיוטקס לא עובד: ייתכן שיותר מלקוח אחד קיבל 201 או שהקובץ מושחת.
    EXPECT_EQ(successful_creations.load(), 1) 
        << "מרוץ סמכויות זוהה! יותר מלקוח אחד הצליח ליצור את אותו הקובץ.";
    
    EXPECT_EQ(rejected_requests.load(), TOTAL_CLIENTS - 1)
        << "לא כל הלקוחות שנדחו קיבלו הודעת שגיאה מתאימה.";

    serverThread.detach();
}