// FileManager.cpp
#include "FileManager.h"
#include <cstdlib>   
#include <stdexcept>   

FileManager::FileManager(const ICompressor& compressor)
    : environmentVariable(),
      m_compressor(compressor) {

    const char* environment = std::getenv("PATH_DIR");

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
