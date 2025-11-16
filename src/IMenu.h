#ifndef IMENU_H
#define IMENU_H

#include <string>
#include <vector>

class IMenu{ 
    public:
    virtual std::vector <std::string> nextCommand() = 0;   
};
#endif