#ifndef CONSOLE_MENU_H
#define CONSOLE_MENU_H

#include <string>
#include <vector>
#include "IMenu.h"


class ConsoleMenu : public IMenu{  
    public:
        std::vector <std::string> nextCommand();

        std :: string readInput();

        bool validInput(std :: vector <std :: string> command);
        
        std::vector <std::string> splitCommand(std :: string command);
};
#endif