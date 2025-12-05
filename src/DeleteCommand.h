// DeleteCommand.h
#ifndef DELETECOMMAND_H
#define DELETECOMMAND_H

#include "ICommand.h"

class DeleteCommand : public ICommand{

public:

    void execute(const std::vector<std::string>& comand, FileManager& fm) override;
};

#endif

