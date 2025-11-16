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
    IMenu*      m_menu;
    std::map<std::string, ICommand*> m_commands;

public:
    App(ICompressor* compressor, IMenu* menu);
    void run();
};

#endif
