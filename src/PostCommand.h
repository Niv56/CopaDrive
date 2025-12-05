// AddCommand.h
#ifndef POSTCOMMAND_H
#define POSTCOMMAND_H

#include "ICommand.h"

class PostCommand : public ICommand {
public:
   
    // Execute the 'post' command: save the given content into a new file.
    // Format of comand:['post', <filename>, <content>]
    // If the file exists, it will be overwritten.
    void execute(const std::vector<std::string>& comand, FileManager& fm) override;
    };

#endif
