#include "CommandParser.h"
#include <sstream>
#include <algorithm>
#include <iostream>

// Parses a raw command line into tokens: command name + arguments.
std::vector<std::string> CommandParser::parse(const std::string& input) {
    std::vector<std::string> parts;

    if (input.empty()) return {};

    std::string command = input;

    // Strip all line-ending characters.
    command.erase(std::remove(command.begin(), command.end(), '\r'), command.end());
    command.erase(std::remove(command.begin(), command.end(), '\n'), command.end());

    std::istringstream iss(command);

    // Read the command name.
    std::string commandName;
    if (!(iss >> commandName)) {
        return {};
    }

    // Normalize to lower case so commands are case-insensitive.
    for (char& c : commandName) c = std::tolower(c);
    parts.push_back(commandName);

    // search: "search" + free text.
    if (commandName == "search") {
        std::string rest;
        std::getline(iss, rest);

        if (!rest.empty() && rest[0] == ' ') {
            rest.erase(0, 1);
        }

        if (rest.empty()) {
            return {};
        }

        parts.push_back(rest);
        return parts;
    }

    // get/delete: exactly one filename.
    if (commandName == "get" || commandName == "delete") {
        std::string filename;

        if (!(iss >> filename)) {
            return {};
        }

        std::string extra;
        if (iss >> extra) {
            return {};
        }

        parts.push_back(filename);
        return parts;
    }

    // post: "post" + filename + rest of line as content.
    if (commandName == "post") {
        std::string filename;

        if (!(iss >> filename)) {
            return {};
        }

        parts.push_back(filename);

        std::string content;
        std::getline(iss, content);

        if (!content.empty() && content[0] == ' ') {
            content.erase(0, 1);
        }

        parts.push_back(content);
        return parts;
    }

    return {};
}
