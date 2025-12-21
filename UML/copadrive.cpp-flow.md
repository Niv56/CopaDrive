```mermaid
flowchart TB

    %% ===== Lanes / Areas =====
    subgraph CLIENT ["Client"]
        Cli["C++ Client<br/>or Python Client"]
        CliSend["Sends command line:<br/>post / get / delete / search"]
        CliRecv["Receives response:<br/>status line + optional body"]
    end

    subgraph SERVER ["CPP Server"]
        Main["main.cpp<br/>creates TCPServer(port)"]
        TCP["TCPServer::start()<br/>socket + bind + listen + accept loop"]
        Pool["ThreadPool<br/>enqueue(session)"]
        Session["ClientSession::run()<br/>per-client session"]
        IO["SocketIOHandler<br/>implements IIOHandler"]
        AppNode["App::run()<br/>command loop"]
        Parser["CommandParser::parse()<br/>normalize + tokenize"]
        CmdInt["ICommand<br/>execute(args, FileManager)"]
        Result["CommandResult<br/>(status + body)<br/>format() => '<code> <msg>'"]
    end

    subgraph STORAGE ["Storage / Files"]
        FM["FileManager<br/>PATH_DIR + mutex<br/>resolvePath()"]
        Disk["Disk directory (PATH_DIR)<br/>stores file contents"]
        Comp["RLECompressor (ICompressor)<br/>compress/decompress"]
    end

    %% ===== Connection flow =====
    Cli --> CliSend --> Main --> TCP -->|"accept()"| Pool
    Pool -->|"runs lambda"| Session
    Session -->|"wrap socket"| IO --> AppNode
    AppNode -->|"read() line"| Parser -->|"tokens"| CmdInt

    %% ===== Concrete commands =====
    Post["PostCommand<br/>createIfAbsent / write"]
    Get["GetCommand<br/>read"]
    Del["DeleteCommand<br/>remove"]
    Search["SearchCommand<br/>listFiles + read + match"]

    CmdInt --> Post
    CmdInt --> Get
    CmdInt --> Del
    CmdInt --> Search

    %% ===== Data flows =====
    Post   -->|"FileManager::createIfAbsent(...) / write(...)"| FM
    Get    -->|"FileManager::read(...)"| FM
    Del    -->|"FileManager::remove(...)"| FM
    Search -->|"FileManager::listFiles() + read(...)"| FM

    FM -->|"uses compressor"| Comp
    FM -->|"reads/writes"| Disk

    %% ===== Response path =====
    AppNode --> Result -->|"write() status + body lines"| IO --> CliRecv
