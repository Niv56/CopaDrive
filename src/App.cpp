#include "App.h"
#include "AddCommand.h"
#include "GetCommand.h"
#include "SearchCommand.h"
#include <iostream>

App::App(ICompressor* compressor, IMenu* menu)
    : m_fileManager(*compressor),
      m_menu(menu) {

    m_commands["add"]    = new AddCommand();
    m_commands["get"]    = new GetCommand();
    m_commands["search"] = new SearchCommand();
}

void App::run() {
    while (true) {
        std::vector<std::string> command = m_menu->nextCommand();

        if (command.empty()) {
            continue;
        }

        std::string cmdName = command[0]; // "add"/"get"/"search"

        auto it = m_commands.find(cmdName);
        if (it == m_commands.end()) {
            continue; // unknown command
        }

        it->second->execute(command, m_fileManager);
    }
}
