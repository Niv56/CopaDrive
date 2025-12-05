#include "FileManager.h"
#include <cstdlib>
#include <stdexcept>
#include <fstream>
#include <filesystem>
#include <sstream>
#include <iostream>

namespace fs = std::filesystem;

// Initialize the static mutex (mandatory in .cpp file)
std::mutex FileManager::_fsMutex;

// Initialize the Filemanager with the provided compressor
FileManager::FileManager(const ICompressor& compressor)
    : environmentVariable(), m_compressor(compressor) {

    // Retrive the directory path from the "PATH_DIR" enviroment variable.
    const char* environment = std::getenv("PATH_DIR");
    
    // If PATH_DIR is not defined, fail with an error
    if (environment == nullptr) {
        this->environmentVariable = ".";
    }

    this->environmentVariable = environment;
}

const std::string& FileManager::getEnvironment() const {
    return environmentVariable;
}

const ICompressor& FileManager::getCompressor() const {
    return m_compressor;
}

std::string FileManager::resolvePath(const std::string& filename) const {
    fs::path basePath(environmentVariable);
    return (basePath / filename).string();
}

/*  Thread Safety Implementation Notes:
    Boundary: The static mutex _fsMutex guards ALL file system write/read operations.
    Scope: The lock is held for the entire duration of the function to prevent partial reads/writes.
    Safety: std::lock_guard ensures the mutex is released even if exceptions occur.
*/
bool FileManager::writeCompressed(const std::string& filename, const std::string& content) {
    // [Verification] Log entry to verify mutual exclusion
    // std::cout << "[Thread " << std::this_thread::get_id() << "] Waiting for FS lock..." << std::endl;

    std::lock_guard<std::mutex> lock(_fsMutex); 
    
    // std::cout << "[Thread " << std::this_thread::get_id() << "] Acquired FS lock. Writing..." << std::endl;

    std::string compressed = m_compressor.compress(content);
    std::string fullPath = resolvePath(filename);

    std::ofstream out(fullPath, std::ios::binary);
    if (!out.is_open()) {
        return false;
    }

    out << compressed;
    return true;
}

std::optional<std::string> FileManager::readCompressed(const std::string& filename) {
    std::lock_guard<std::mutex> lock(_fsMutex);

    std::string fullPath = resolvePath(filename);
    std::ifstream in(fullPath, std::ios::binary);
    
    if (!in.is_open()) {
        return std::nullopt;
    }

    std::ostringstream buffer;
    buffer << in.rdbuf();
    
    return buffer.str();
}

std::vector<std::string> FileManager::searchInFiles(const std::string& search_text) {
    std::lock_guard<std::mutex> lock(_fsMutex);

    std::vector<std::string> results;
    std::string base = getEnvironment();

    if (!fs::exists(base) || !fs::is_directory(base)) {
        return results;
    }

    for (const auto& entry : fs::directory_iterator(base)) {
        if (!entry.is_regular_file()) continue;

        std::string filename = entry.path().filename().string();
        
        std::ifstream in(entry.path(), std::ios::binary);
        if (!in.is_open()) continue;
        
        std::ostringstream buffer;
        buffer << in.rdbuf();
        std::string compressedContent = buffer.str();
        
        std::string decompressed;
        try {
            decompressed = m_compressor.decompress(compressedContent);
        } catch (...) { continue; }

        if (decompressed.find(search_text) != std::string::npos || 
            filename.find(search_text) != std::string::npos) {
            results.push_back(filename);
        }
    }
    
    return results;
}