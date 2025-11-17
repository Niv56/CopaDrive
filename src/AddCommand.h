// AddCommand.h
#ifndef ADDCOMMAND_H
#define ADDCOMMAND_H

#include "ICommand.h"

class AddCommand : public ICommand {
public:
    // Command format: [ add , fileName, content]
    void execute(const std::vector<std::string>& comand, FileManager& fm) override;
    };

#endif
