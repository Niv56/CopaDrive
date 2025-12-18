#ifndef IIOHANDLER_H
#define IIOHANDLER_H
#include <string>

// Abstract IO channel (console, socket, etc.) used by the App.
class IIOHandler {
public:
    virtual ~IIOHandler() = default;

    // Read a single line/message.
    virtual std::string read() = 0;

    // Write a single line/message.
    virtual void write(const std::string& data) = 0;
};

#endif
