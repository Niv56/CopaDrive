// AddCommand.h
#ifndef ADDCOMMAND_H
#define ADDCOMMAND_H

#include "ICommand.h"

class AddCommand : public ICommand {
public:
   
    // Execute the 'add' command: save the given content into a new file.
    // Format of comand:['add', <filename>, <content>]
    // If the file exists, it will be overwritten.
    void execute(const std::vector<std::string>& comand, FileManager& fm) override;
    };

#endif
