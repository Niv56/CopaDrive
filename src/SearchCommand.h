// SearchCommand.h
#ifndef SEARCHCOMMAND_H
#define SEARCHCOMMAND_H

#include "ICommand.h"

class SearchCommand : public ICommand {
public:
    // Command format: ["search", text]
    void execute(const std::vector<std::string>& comand,
                 FileManager& fm) override;
};

#endif
