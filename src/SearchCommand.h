#ifndef SEARCHCOMMAND_H
#define SEARCHCOMMAND_H
#include "ICommand.h"
#include "CommandResult.h"

// Command that searches all stored files by content or filename.
class SearchCommand : public ICommand {
public:
    // Executes: SEARCH <text>, returns matching filenames (one per line).
    CommandResult execute(const std::vector<std::string>& comand, FileManager& fm) override;
};

#endif
