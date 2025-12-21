```mermaid
classDiagram
class TCPServer {
  -int _port
  -int _server_socket
  -RLECompressor m_compressor
  -FileManager m_fm
  -ThreadPool m_pool
  -atomic~bool~ m_running
  +TCPServer(int port)
  +~TCPServer()
  +start() void
  +stop() void
}

class ClientSession {
  -int _clientSocket
  -FileManager& m_fm
  +ClientSession(int clientSocket, FileManager& sharedFile)
  +run() void
}

class App {
  -FileManager& m_fileManager
  -IIOHandler* m_io
  -map~string,ICommand*~ m_commands
  +App(IIOHandler* io, FileManager& fileManager)
  +run() void
}

class ICommand {
  <<interface>>
  +execute(vector~string~, FileManager&) CommandResult
}

class PostCommand { +execute(...) CommandResult }
class GetCommand { +execute(...) CommandResult }
class DeleteCommand { +execute(...) CommandResult }
class SearchCommand { +execute(...) CommandResult }

class CommandParser {
  <<static>>
  +parse(string) vector~string~
}

class CommandResult {
  +StatusCode status
  +string body
  <<static>>
  +format(CommandResult) string
}

class StatusCode {
  <<enum>>
  CREATED
  NO_CONTENT
  OK
  NOT_FOUND
  BAD_REQUEST
  INTERNAL_SERVER_ERROR
}

class IIOHandler {
  <<interface>>
  +read() string
  +write(string) void
}

class SocketIOHandler {
  -int _client_socket
  +SocketIOHandler(int clientSocket)
  +~SocketIOHandler()
  +read() string
  +write(string) void
}

class FileManager {
  -string environmentVariable
  -const ICompressor& m_compressor
  -static mutex _fsMutex
  +FileManager(const ICompressor& compressor)
  +resolvePath(filename) string
  +write(filename,content) bool
  +read(filename) optional~string~
  +remove(filename) bool
  +exists(filename) bool
  +listFiles() vector~string~
  +createIfAbsent(filename,content) CreateStatus
}

class CreateStatus {
  <<enum>>
  Created
  AlreadyExists
  IOError
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

class ThreadPool {
  +ThreadPool(size_t workers)
  +enqueue(function) void
  +shutdown() void
}

TCPServer --> ClientSession : enqueues session
TCPServer --> FileManager : owns
TCPServer --> RLECompressor : owns
TCPServer --> ThreadPool : owns

ClientSession --> SocketIOHandler : creates/uses
SocketIOHandler ..|> IIOHandler
ClientSession --> App : creates
ClientSession --> FileManager : shares

App --> IIOHandler : uses
App --> FileManager : uses
App --> CommandParser : uses
App --> ICommand : holds*

ICommand <|.. PostCommand
ICommand <|.. GetCommand
ICommand <|.. DeleteCommand
ICommand <|.. SearchCommand

ICommand --> CommandResult : returns
CommandResult --> StatusCode : uses

FileManager --> ICompressor : uses
ICompressor <|.. RLECompressor
FileManager --> CreateStatus : returns
