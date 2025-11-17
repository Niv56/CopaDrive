#ifndef ICOMMAND_H
#define ICOMMAND_H

#include <string>
#include <vector>

class FileManager;

class ICommand {
public:
    virtual ~ICommand() = default;

    virtual void execute(const std::vector<std::string>& comand, FileManager& fm) = 0;
};

#endif
