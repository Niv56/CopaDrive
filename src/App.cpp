#include "App.h"
#include "AddCommand.h"
#include "GetCommand.h"
#include "SearchCommand.h"

App::App(ICompressor* compressor, IMenu* menu)
    : m_fileManager(*compressor),
      m_menu(menu) {

    //Map command name to thier command object
    m_commands["add"]    = new AddCommand();
    m_commands["get"]    = new GetCommand();
    m_commands["search"] = new SearchCommand();
}


void App::run() {
    
    while (true) {

        // Get a command from the user and split it into vector.
        std::vector<std::string> comand = m_menu->nextCommand();

        //  Ignor empty commands 
        if (comand.empty()) {
            continue;
        }

        // cmdName can be:"add"/"get"/"search"
        std::string cmdName = comand[0]; 

        // Skip unknown commands
        auto it = m_commands.find(cmdName);
        if (it == m_commands.end()) {
            continue; 
        }

        // Execute the requested command
        it->second->execute(comand, m_fileManager);
    }
}
