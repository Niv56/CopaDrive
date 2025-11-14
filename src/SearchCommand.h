#ifndef SEARCHCOMMAND_H
#define SEARCHCOMMAND_H

#include "ICommand.h"

class SearchCommand : public ICommand {
public:
    void execute() override;
};

#endif
