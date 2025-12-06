// PostCommand.h
#ifndef POSTCOMMAND_H
#define POSTCOMMAND_H

#include "ICommand.h"
#include "CommandResult.h"

class PostCommand : public ICommand {
public:
   
    // Execute the 'post' command: save the given content into a new file.
    // Format of comand:['post', <filename>, <content>]
    // If the file exists, it will be overwritten.
    // If the command succed it return 201 created.
    CommandResult execute(const std::vector<std::string>& comand, FileManager& fm) override;
    };

#endif
