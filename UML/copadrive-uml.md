```mermaid
classDiagram
    class TCPServer {
        -int _port
        -int _server_socket
        -RLECompressor m_compressor
        -FileManager m_fm
        +TCPServer(int port)
        +~TCPServer()
        +start()
    }

    class ClientSession {
        -int _clientSocket
        -FileManager& m_fm
        +ClientSession(int, FileManager&)
        +run()
    }

    class App {
        -FileManager& m_fileManager
        -IIOHandler* m_io
        -map<string, ICommand*> m_commands
        +App(IIOHandler*, FileManager&)
        +run()
    }

    class FileManager {
        -string environmentVariable
        -const ICompressor& m_compressor
        -static mutex _fsMutex
        +FileManager(const ICompressor&)
        +getEnvironment() string
        +getCompressor() ICompressor&
        +writeCompressed(filename, content) bool
        +readCompressed(filename) optional<string>
        +searchInFiles(text) vector<string>
    }

    class ICommand {
        <<interface>>
        +execute(vector<string>&, FileManager&) CommandResult
    }

    class PostCommand {
        +execute(...)
    }
    class GetCommand {
        +execute(...)
    }
    class DeleteCommand {
        +execute(...)
    }
    class SearchCommand {
        +execute(...)
    }

    class ICompressor {
        <<interface>>
        +compress(string) string
        +decompress(string) string
    }

    class RLECompressor {
        +compress(string) string
        +decompress(string) string
    }

    class IIOHandler {
        <<interface>>
        +read() string
        +write(string)
    }

    class SocketIOHandler {
        -int _client_socket
        +SocketIOHandler(int)
        +~SocketIOHandler()
        +read() string
        +write(string)
    }

    class CommandParser {
        +parse(string) vector<string>
    }

    class CommandResult {
        +StatusCode status
        +string body
        +format(result) string
    }

    TCPServer --> ClientSession : creates
    TCPServer --> FileManager : owns
    TCPServer --> RLECompressor : owns

    ClientSession --> App : creates
    ClientSession --> SocketIOHandler : uses
    ClientSession --> FileManager : shares

    App --> IIOHandler : uses
    App --> FileManager : uses
    App --> ICommand : holds*

    ICommand <|.. PostCommand
    ICommand <|.. GetCommand
    ICommand <|.. DeleteCommand
    ICommand <|.. SearchCommand

    ICompressor <|.. RLECompressor
    IIOHandler <|.. SocketIOHandler
