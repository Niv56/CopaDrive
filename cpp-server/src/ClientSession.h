#ifndef CLIENTSESSION_H
#define CLIENTSESSION_H

class FileManager;

// Handles a single client connection on its own thread.
class ClientSession {
private:
    int _clientSocket;
    FileManager& m_fm;

public:
    ClientSession(int clientSocket, FileManager& sharedFile);

    // Runs the session logic for this client.
    void run();
};

#endif
