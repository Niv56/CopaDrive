// SearchCommand.h
#ifndef SEARCHCOMMAND_H
#define SEARCHCOMMAND_H

#include "ICommand.h"
#include "CommandResult.h"

class SearchCommand : public ICommand {
public:
    // Execute the 'search' command: print list of files that contain the given search term.
    // Format of command: ['search' ,<content>]
    CommandResult execute(const std::vector<std::string>& comand, FileManager& fm) override;

};

#endif
