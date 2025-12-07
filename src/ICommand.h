#ifndef ICOMMAND_H
#define ICOMMAND_H
#include <string>
#include <vector>
#include <CommandResult.h>

class FileManager;

// Base interface for all concrete commands (POST / GET / SEARCH / DELETE).
class ICommand {
public:
    virtual ~ICommand() = default;

    // Run the command using parsed input and shared FileManager.
    // Returns the status code and optional data for the response.
    virtual CommandResult execute(const std::vector<std::string>& comand, FileManager& fm) = 0;
};

#endif
