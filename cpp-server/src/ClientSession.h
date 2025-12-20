#ifndef CLIENTSESSION_H
#define CLIENTSESSION_H

class FileManager;

class ClientSession {
private:
    int _clientSocket;
    FileManager& m_fm;

public:
    explicit ClientSession(int clientSocket, FileManager& sharedFile);
    void run();
};

#endif
