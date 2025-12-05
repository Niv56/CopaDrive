#include "App.h"
#include "AddCommand.h"
#include "GetCommand.h"
#include "SearchCommand.h"
#include "CommandParser.h"
#include <iostream>

App::App(ICompressor* compressor, IIOHandler* io)
    : m_fileManager(*compressor),
      m_io(io) {

    //Map command name to thier command object
    m_commands["add"]    = new AddCommand();
    m_commands["get"]    = new GetCommand();
    m_commands["search"] = new SearchCommand();
    m_commands["post"]   = new AddCommand();
}


void App::run() {
    
    while (true) {
         std::string input = m_io->read();

         if (input.empty()) {
            break; 
        }

        std::vector<std::string> command = CommandParser::parse(input);

        if (command.empty()) {
            continue;
        }

        std::string cmdName = command[0]; // "add"/"get"/"search"

        // Skip unknown commands
        auto it = m_commands.find(cmdName);
        if (it == m_commands.end()) {
            continue; 
        }

        it->second->execute(command, m_fileManager);
    }
}
