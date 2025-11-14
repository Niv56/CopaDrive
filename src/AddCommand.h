// AddCommand.h
#ifndef ADDCOMMAND_H
#define ADDCOMMAND_H

#include "ICommand.h"

// this class responsibility: handle 'add' command
class AddCommand : public ICommand {
public:
    void execute() override;
};

#endif
