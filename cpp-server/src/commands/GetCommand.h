#ifndef GETCOMMAND_H
#define GETCOMMAND_H
#include "ICommand.h"
#include "CommandResult.h"

// Command that reads a stored file and returns its decompressed content.
class GetCommand : public ICommand {
public:
    // Executes: GET <filename>.
    CommandResult execute(const std::vector<std::string>& comand, FileManager& fm) override;
};

#endif
