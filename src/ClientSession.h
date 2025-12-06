#ifndef CLIENTSESSION_H
#define CLIENTSESSION_H

class FileManager;

class ClientSession {
private:
    int _clientSocket;
    FileManager& m_fm;

public:
    ClientSession(int clientSocket , FileManager& sharedFile);
    
    // Loop for running the thread that will use App
    void run();
};

#endif