#include "App.h"
#include "ICommand.h"
#include "ICompressor.h"
#include "AddCommand.h"
#include "GetCommand.h"
#include "SearchCommand.h"

App :: App(ICompressor* compressor ,IMenu* menu) : m_fileManager (*compressor), m_menu(menu)
{
        ICommand* addCommand = new AddCommand(m_fileManager);
        ICommand* getCommand = new GetCommand(m_fileManager);
        ICommand* searchCommand = new SearchCommand(m_fileManager);

        m_commands["add"] = addCommand;
        m_commands["get"] = getCommand;
        m_commands["search"] = searchCommand;

}

void App:: run(){
    std :: vector <std :: string> task = m_menu ->nextCommand();

    try {}
}