#include "App.h"
#include "PostCommand.h"
#include "GetCommand.h"
#include "SearchCommand.h"
#include "DeleteCommand.h"
#include "CommandParser.h"
#include "CommandResult.h"

#include <sstream>
#include <vector>

// ====== Constructor ======
App::App(IIOHandler *io, FileManager &fileManager)
    : m_fileManager(fileManager),
      m_io(io)
{
   
    m_commands["post"]   = new PostCommand();
    m_commands["get"]    = new GetCommand();
    m_commands["search"] = new SearchCommand();
    m_commands["delete"] = new DeleteCommand();
}

// ====== Main loop ======
void App::run()
{
    while (true)
    {
        std::string input = m_io->read();

        if (input.empty())
        {
            break;
        }

        CommandResult result(StatusCode::BAD_REQUEST, "");

        std::vector<std::string> command = CommandParser::parse(input);

        if (!command.empty())
        {
            std::string cmdName = command[0]; // "post"/"get"/"search"/"delete"
            auto it = m_commands.find(cmdName);

            if (it != m_commands.end())
            {
                result = it->second->execute(command, m_fileManager);
            }
        }

        m_io->write(CommandResult::format(result));

        if (result.status == StatusCode::OK && !result.body.empty())
        {

            m_io->write("");

            std::stringstream ss(result.body);
            std::string line;
            while (std::getline(ss, line))
            {
                m_io->write(line);
            }

            m_io->write("");
        }
    }
}
