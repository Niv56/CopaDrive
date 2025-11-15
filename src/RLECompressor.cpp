#include "RLECompressor.h"

#include <sstream>   // std::ostringstream
#include <iomanip>   // std::hex, std::setw, std::setfill, std::uppercase
#include <cctype>    // std::isdigit
#include <string>

using std::string;

// Helper: convert a character to 2-digit uppercase hex (e.g. 'a' -> "61")
static string toHex(unsigned char c) {
    std::ostringstream oss;
    oss << std::hex << std::uppercase
        << std::setw(2) << std::setfill('0')
        << static_cast<int>(c);
    return oss.str();
}

// Helper: convert 2-digit hex at position pos to a char
static unsigned char fromHex(const string& s, size_t pos) {
    int value = std::stoi(s.substr(pos, 2), nullptr, 16);
    return static_cast<unsigned char>(value);
}

// Encode: aaabb -> 3:61;2:62;
string RLECompressor::compress(const string& input) const {
    if (input.empty()) {
        return "";
    }

    string result;

    unsigned char current = static_cast<unsigned char>(input[0]);
    int count = 1;

    for (size_t i = 1; i < input.size(); ++i) {
        unsigned char ch = static_cast<unsigned char>(input[i]);
        if (ch == current) {
            ++count;
        } else {
            // write "<count>:<hex>;"
            result += std::to_string(count);
            result += ':';
            result += toHex(current);
            result += ';';

            current = ch;
            count = 1;
        }
    }

    // last run
    result += std::to_string(count);
    result += ':';
    result += toHex(current);
    result += ';';

    return result;
}

// Decode: 3:61;2:62; -> aaabb
string RLECompressor::decompress(const string& input) const {
    string result;
    size_t i = 0;

    while (i < input.size()) {
        // 1) parse count (digits) until ':'
        if (!std::isdigit(static_cast<unsigned char>(input[i]))) {
            // invalid format – stop decoding
            break;
        }

        string countStr;
        while (i < input.size() &&
               std::isdigit(static_cast<unsigned char>(input[i]))) {
            countStr += input[i];
            ++i;
        }

        if (i >= input.size() || input[i] != ':') {
            // invalid format
            break;
        }
        ++i; // skip ':'

        if (i + 1 >= input.size()) {
            // not enough characters for two hex digits
            break;
        }

        unsigned char ch = fromHex(input, i);
        i += 2; // consumed two hex chars

        // optional ';' separator
        if (i < input.size() && input[i] == ';') {
            ++i;
        }

        int count = std::stoi(countStr);
        result.append(count, static_cast<char>(ch));
    }

    return result;
}
