#include "App.h"
#include "PostCommand.h"
#include "GetCommand.h"
#include "SearchCommand.h"
#include "DeleteCommand.h"
#include "CommandParser.h"
#include "CommandResult.h"

#include <iostream>

App::App(ICompressor* compressor, IIOHandler* io)
    : m_fileManager(*compressor),
      m_io(io) {

    //Map command name to thier command object
    m_commands["post"]    = new PostCommand();
    m_commands["get"]    = new GetCommand();
    m_commands["search"] = new SearchCommand();
    m_commands["delete"]   = new DeleteCommand();
}


void App::run() {
    
    while (true) {
         std::string input = m_io->read();

          if (input.empty()) {
            break; }

         // Set defult case for commands (unknoen command - bad request)
         CommandResult result =CommandResult(StatusCode::BAD_REQUEST,"");
         
         std::vector<std::string> command = CommandParser::parse(input);

        if (!command.empty()) {

            std::string cmdName = command[0]; // "post"/"get"/"search"/"delete"
            auto it = m_commands.find(cmdName);
            
            if (it != m_commands.end()) {
                result = it->second->execute(command, m_fileManager);
            } 
          m_io->write(CommandResult::format(result));
        }
    }
}
