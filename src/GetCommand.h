#ifndef GETCOMMAND_H
#define GETCOMMAND_H

#include "ICommand.h"

class GetCommand : public ICommand {
public:
    void execute() override;
};

#endif
