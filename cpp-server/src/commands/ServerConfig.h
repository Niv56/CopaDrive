#ifndef SERVER_CONFIG_H
#define SERVER_CONFIG_H
#include <string>
#include <stdexcept>
#include <algorithm>
#include <cctype>

// Helper for validating and parsing the server's listening port.
class ServerUtils {
public:
    // Convert a string to a valid port number [1..65535], or throw on invalid input.
    static int parsePort(const std::string& portStr) {
        bool isNumeric = !portStr.empty() && std::all_of(portStr.begin(), portStr.end(), ::isdigit);
        
        if (!isNumeric) {
            throw std::invalid_argument("Port must be a number");
        }

        int port = std::stoi(portStr);

        if (port < 1 || port > 65535) {
            throw std::out_of_range("Port must be between 1 and 65535");
        }

        return port;
    }
};

#endif
