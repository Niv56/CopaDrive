#ifndef APP_H
#define APP_H

#include "ICommand.h"
#include "IMenu.h"
#include "FileManager.h"
#include "ICompressor.h"

#include <map>
#include <string>
#include <vector>

class App {
private:
    FileManager m_fileManager;
    // Defines the user interface for reading commands
    IMenu* m_menu;
    //maps command names to their ICommand handlers
    std::map<std::string, ICommand*> m_commands;

public:

    //  Initialize the App with given menu and compressor components.
    App(ICompressor* compressor, IMenu* menu);
    // Main application loop: read, validate, and execute user commands
    void run();
};

#endif
