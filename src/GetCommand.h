// GetCommand.h
#ifndef GETCOMMAND_H
#define GETCOMMAND_H

#include "ICommand.h"

class GetCommand : public ICommand {
public:
    // Command format: ["get", fileName]
    void execute(const std::vector<std::string>& comand,
                 FileManager& fm) override;
};

#endif
