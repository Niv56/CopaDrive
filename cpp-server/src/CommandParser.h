#ifndef COMMANDPARSER_H
#define COMMANDPARSER_H
#include <string>
#include <vector>

// Responsible for splitting a raw input line into command name + arguments.
class CommandParser {
public:
    static std::vector<std::string> parse(const std::string& input);
};

#endif
