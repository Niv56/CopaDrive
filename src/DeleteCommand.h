#ifndef DELETECOMMAND_H
#define DELETECOMMAND_H

#include "ICommand.h"
#include "CommandResult.h"

class DeleteCommand : public ICommand{

public:

    CommandResult execute(const std::vector<std::string>& comand, FileManager& fm) override;
};

#endif

