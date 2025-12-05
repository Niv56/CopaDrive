#ifndef CLIENTSESSION_H
#define CLIENTSESSION_H

class ClientSession {
private:
    int _clientSocket;

public:
    ClientSession(int clientSocket);
    
    // Loop for running the thread that will use App
    void run();
};

#endif