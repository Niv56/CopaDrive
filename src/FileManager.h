#ifndef FILE_MANAGER_H
#define FILE_MANAGER_H
#include <iostream>
#include <string>
#include <vector>

class ICompressor;

class FileManager{
    private:
    std :: string environmentVariable;
    const ICompressor& m_compressor;

    public:

    FileManager (const ICompressor& compressor);

    void saveFile(const std :: string& filename, const std :: string& content);
    std :: string loadFile (const std :: string& filename);
    std :: vector <std :: string > search (const std :: string& content);
};


#endif
