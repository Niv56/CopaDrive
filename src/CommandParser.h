#ifndef COMMANDPARSER_H
#define COMMANDPARSER_H

#include <string>
#include <vector>

class CommandParser {
public:
    // Static function that receives a string and returns a vector of commands.
    static std::vector<std::string> parse(const std::string& input);
};

#endif