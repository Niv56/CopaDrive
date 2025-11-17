// SearchCommand.h
#ifndef SEARCHCOMMAND_H
#define SEARCHCOMMAND_H

#include "ICommand.h"

class SearchCommand : public ICommand {
public:
    // Execute the 'search' command: print list of files that contain the given search term.
    // Format of command: ['search' ,<content>]
    void execute(const std::vector<std::string>& comand, FileManager& fm) override;

};

#endif
