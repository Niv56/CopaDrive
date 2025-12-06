#ifndef IMENU_H
#define IMENU_H

#include <string>
#include <vector>

// Interface for user input menus.
class IMenu{ 
    public:
    // nextCommand() reads raw input, parses it, and returns the command vector.
    virtual std::vector <std::string> nextCommand() = 0;   
};
#endif