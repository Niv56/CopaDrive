#ifndef APP_H
#define APP_H
#include "ICommand.h"
#include "IIOHandler.h"
#include "FileManager.h"
#include "ICompressor.h"
#include <map>
#include <string>
#include <vector>

// Central application class: wires IO, commands and file manager together.
class App {
private:
    // Shared file-storage API (thread-safe, used by all commands).
    FileManager& m_fileManager;
    // Abstract IO channel (console or socket).
    IIOHandler* m_io;
    // Maps command names to their handlers.
    std::map<std::string, ICommand*> m_commands;

public:
    // Construct the app with a concrete IO and FileManager.
    App(IIOHandler* io, FileManager& FileManager);

    // Main loop: read a command, dispatch to the right ICommand, send response.
    void run();
};

#endif
