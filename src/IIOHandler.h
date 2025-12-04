#ifndef IIOHANDLER_H
#define IIOHANDLER_H

#include <string>

class IIOHandler {
public:
    virtual ~IIOHandler() = default;

    // Reads texts
    virtual std::string read() = 0;

    // Sends texts
    virtual void write(const std::string& data) = 0;
};

#endif