```mermaid
flowchart TB

    %% ===== Lanes / Areas =====

    subgraph CLIENT ["Client"]
        Cli["C++ Client<br/>or Python Client"]
        CliSend["Sends command line:<br/>post / get / delete / search"]
    end

    subgraph SERVER ["Server"]
        Main["main.cpp<br/>creates TCPServer(port)"]
        TCP["TCPServer<br/>socket + bind + listen + accept"]
        Session["ClientSession<br/>thread per client"]
        AppNode["App::run()<br/>per-client main loop"]
        Parser["CommandParser<br/>splits line into command + args"]
        CmdInt["ICommand<br/>abstract command interface"]
    end

    subgraph STORAGE ["Storage / Files"]
        FM["FileManager<br/>file access + mutex"]
        RLE["RLECompressor<br/>compress / decompress"]
        Disk["PATH_DIR<br/>compressed files on disk"]
    end

    %% ===== Connection flow =====
    Cli --> CliSend --> Main --> TCP -->|"accept()"| Session
    Session -->|"wraps socket in SocketIOHandler"| AppNode
    AppNode -->|"calls read() from socket"| Parser
    Parser -->|"command + args"| CmdInt

    %% ===== Concrete commands =====
    Post["PostCommand<br/>create new compressed file"]
    Get["GetCommand<br/>read compressed file"]
    Del["DeleteCommand<br/>delete file"]
    Search["SearchCommand<br/>search text in files"]

    CmdInt --> Post
    CmdInt --> Get
    CmdInt --> Del
    CmdInt --> Search

    %% ===== Data flows =====
    Post   -->|"writeCompressed"| FM
    Get    -->|"readCompressed<br/>+ decompress"| FM
    Del    -->|"std::filesystem::remove"| FM
    Search -->|"searchInFiles / readCompressed"| FM

    FM -->|"compress / decompress"| RLE
    FM --> Disk

    %% ===== Response path =====
    AppNode -->|"CommandResult<br/>(status + body)"| Cli
