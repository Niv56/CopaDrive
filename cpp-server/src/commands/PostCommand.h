#ifndef POSTCOMMAND_H
#define POSTCOMMAND_H
#include "ICommand.h"
#include "CommandResult.h"

// Command that stores (or overwrites) a compressed file.
class PostCommand : public ICommand {
public:
    // Executes: POST <filename> <content>, returns 201 on success.
    CommandResult execute(const std::vector<std::string>& comand, FileManager& fm) override;
};

#endif
