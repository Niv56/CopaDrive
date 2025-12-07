#include "App.h"
#include "PostCommand.h"
#include "GetCommand.h"
#include "SearchCommand.h"
#include "DeleteCommand.h"
#include "CommandParser.h"
#include "CommandResult.h"
#include <sstream>
#include <vector>

// Builds the app with a generic IO channel and a shared FileManager.
App::App(IIOHandler *io, FileManager &fileManager)
    : m_fileManager(fileManager),
      m_io(io)
{
    // Register supported commands by name (case already normalized).
    m_commands["post"]   = new PostCommand();
    m_commands["get"]    = new GetCommand();
    m_commands["search"] = new SearchCommand();
    m_commands["delete"] = new DeleteCommand();
}

// Main loop for handling a single client connection.
void App::run()
{
    while (true)
    {
        // Read one command line from the client.
        std::string input = m_io->read();

        // Empty input means the client closed the connection.
        if (input.empty())
        {
            break;
        }

        // Default to bad request until a valid command is found.
        CommandResult result(StatusCode::BAD_REQUEST, "");

        // Tokenize input into command name + arguments.
        std::vector<std::string> command = CommandParser::parse(input);

        if (!command.empty())
        {
            std::string cmdName = command[0];
            auto it = m_commands.find(cmdName);

            // If we know this command, delegate to its handler.
            if (it != m_commands.end())
            {
                result = it->second->execute(command, m_fileManager);
            }
        }

        // Always send back the status line.
        m_io->write(CommandResult::format(result));

        // For successful commands with body, send the content line by line.
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
