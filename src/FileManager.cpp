// FileManager.cpp
#include "FileManager.h"
#include <cstdlib>   
#include <stdexcept>   

// Initialize the Filemanager with the provided compressor
FileManager::FileManager(const ICompressor& compressor): environmentVariable(),
      m_compressor(compressor) {

    // Retrive the directory path from the "PATH_DIR" enviroment variable.
    const char* environment = std::getenv("PATH_DIR");
    
    // If PATH_DIR is not defined, fail with an error
    if (environment == nullptr) {
        throw std::runtime_error("The getenv method failed");
    }

    this->environmentVariable = environment;
}

const std::string& FileManager::getEnvironment() const {
    return environmentVariable;
}

const ICompressor& FileManager::getCompressor() const {
    return m_compressor;
}
