// GetCommand.h
#ifndef GETCOMMAND_H
#define GETCOMMAND_H

#include "ICommand.h"

class GetCommand : public ICommand {
public:
    // Execute the 'get' command: print the content of a file to the screen.
    // Format of command: ['get', <content>]
    // If the file dosent exist, nothing is printed.
    void execute(const std::vector<std::string>& comand, FileManager& fm) override;
};

#endif
