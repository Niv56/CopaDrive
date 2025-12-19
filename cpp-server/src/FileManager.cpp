#include "FileManager.h"
#include <cstdlib>
#include <fstream>
#include <filesystem>
#include <sstream>

namespace fs = std::filesystem;

/**
 * Constructor: Retrieves the working directory from the "PATH_DIR" environment variable.
 * Defaults to current directory "." if not found.
 */
FileManager::FileManager(const ICompressor &compressor) 
    : m_compressor(compressor) {
    const char *envPath = std::getenv("PATH_DIR");
    this->environmentVariable = (envPath == nullptr) ? "." : envPath;
}

// Private helper: Resolves the absolute/relative path using the environment variable and filename.
std::string FileManager::resolvePath(const std::string &filename) const {
    return (fs::path(environmentVariable) / filename).string();
}

// Writes raw data to the disk. Uses a mutex to ensure thread safety during file I/O.
bool FileManager::write(const std::string &filename, const std::string &content) {
    std::lock_guard<std::mutex> lock(_fsMutex);
    std::ofstream out(resolvePath(filename), std::ios::binary);
    if (!out.is_open()) return false;
    out << content;
    return true;
}

// Reads raw data from the disk. Uses a mutex to ensure thread safety.
std::optional<std::string> FileManager::read(const std::string &filename) const {
    std::lock_guard<std::mutex> lock(_fsMutex);
    std::string fullPath = resolvePath(filename);
    if (!fs::exists(fullPath)) return std::nullopt;

    std::ifstream in(fullPath, std::ios::binary);
    if (!in.is_open()) return std::nullopt;

    std::ostringstream buffer;
    buffer << in.rdbuf();
    return buffer.str();
}

// Removes a file from the disk. Thread-safe operation.
bool FileManager::remove(const std::string &filename) {
    std::lock_guard<std::mutex> lock(_fsMutex);
    return fs::remove(resolvePath(filename));
}

// Checks for file existence on the disk. Thread-safe operation.
bool FileManager::exists(const std::string &filename) const {
    std::lock_guard<std::mutex> lock(_fsMutex);
    return fs::exists(resolvePath(filename));
}

// Iterates through the directory and returns names of all regular files.
std::vector<std::string> FileManager::listFiles() const {
    std::lock_guard<std::mutex> lock(_fsMutex);
    std::vector<std::string> files;
    for (const auto &entry : fs::directory_iterator(environmentVariable)) {
        if (entry.is_regular_file()) files.push_back(entry.path().filename().string());
    }
    return files;
}