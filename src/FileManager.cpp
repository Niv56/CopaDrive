#include "FileManager.h"
#include "ICompressor.h"
#include <cstdlib>
#include <fstream>
#include <filesystem>

//constructor
    FileManager :: FileManager (const ICompressor& compressor): m_compressor(compressor)
    {
        //get an environment variable path
        const char* environment = std :: getenv ("PATH_DIR");
        //check if the getnec succeed
        if(environment == nullptr){
            throw std :: runtime_error ("The getenv method failed");
        }
        //set the path
        this->environmentVariable = environment;
    }