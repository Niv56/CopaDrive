#ifndef CONSOLE_MENU_H
#define CONSOLE_MENU_H

#include <string>
#include <vector>
#include "IMenu.h"


class ConsoleMenu : public IMenu{  
    public:
    
        // Read the raw user input and divide it into command name and arguments.
        std::vector <std::string> nextCommand();

        // Retrieve the raw input line from the user
        std :: string readInput();

        // Validate that the user input matches the expected command format
        bool validInput(std :: vector <std :: string> command);
        
        // Split the raw command string into a command name and its arguments
        std::vector <std::string> splitCommand(std :: string command);
};
#endif