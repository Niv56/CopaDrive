#include "RLECompressor.h"
#include <cctype>   // isdigit
#include <stdexcept>

// Encode: "aaabb" -> "3a2b", "ab" -> "1a1b"
std::string RLECompressor::compress(const std::string& input) const {
    if (input.empty()) {
        return "";
    }

    std::string result;
    char current = input[0];
    int count = 1;

    for (size_t i = 1; i < input.size(); ++i) {
        if (input[i] == current) {
            ++count;
        } else {
            // write "<count><char>"
            result += std::to_string(count);
            result += current;

            current = input[i];
            count = 1;
        }
    }

    // last run
    result += std::to_string(count);
    result += current;

    return result;
}

// Decode: "3a2b" -> "aaabb"
std::string RLECompressor::decompress(const std::string& input) const {
    std::string result;
    std::string countStr;

    for (size_t i = 0; i < input.size(); ++i) {
        char c = input[i];

        if (std::isdigit(static_cast<unsigned char>(c))) {
            // build the number (supports multi-digit counts)
            countStr += c;
        } else {
            // c is the character, countStr is how many times
            int count = 1;
            if (!countStr.empty()) {
                count = std::stoi(countStr);
            }
            result.append(count, c);
            countStr.clear();
        }
    }

    return result;
}
