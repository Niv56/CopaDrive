#ifndef ICOMMAND_H
#define ICOMMAND_H

#include <string>
#include <vector>
#include <CommandResult.h>

class FileManager;

// Command interface: defines a common execute() operation for all commands.
class ICommand {
public:
    virtual ~ICommand() = default;

    // Execute the command using the parsed user input and the FileManager.
    // Each concrete command implements its own execution logic.
    // Each concrete command return return the relevent statuse code and data.
    virtual CommandResult execute(const std::vector<std::string>& comand, FileManager& fm) = 0;
};

#endif
