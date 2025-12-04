#ifndef SERVER_CONFIG_H
#define SERVER_CONFIG_H

#include <string>
#include <stdexcept>
#include <algorithm> // for std::all_of
#include <cctype>    // for std::isdigit

class ServerUtils {
public:
    static int parsePort(const std::string& portStr) {
        // בדיקה שזה מספר
        bool isNumeric = !portStr.empty() && std::all_of(portStr.begin(), portStr.end(), ::isdigit);
        
        if (!isNumeric) {
            throw std::invalid_argument("Port must be a number");
        }

        int port = std::stoi(portStr);

        // בדיקת טווח
        if (port < 1 || port > 65535) {
            throw std::out_of_range("Port must be between 1 and 65535");
        }

        return port;
    }
};

#endif