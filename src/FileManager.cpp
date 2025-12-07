#include "FileManager.h"
#include <cstdlib>
#include <stdexcept>
#include <fstream>
#include <filesystem>
#include <sstream>
#include <iostream>

namespace fs = std::filesystem;

// Static mutex shared by all FileManager instances (guards file-system access).
std::mutex FileManager::_fsMutex;

// Ctor: initialize base directory from PATH_DIR and store compressor reference.
FileManager::FileManager(const ICompressor &compressor)
    : environmentVariable(), m_compressor(compressor)
{
    const char *environment = std::getenv("PATH_DIR");

    if (environment == nullptr)
    {
        this->environmentVariable = ".";
    }
    else
    {
        this->environmentVariable = environment;
    }
}

const std::string &FileManager::getEnvironment() const
{
    return environmentVariable;
}

const ICompressor &FileManager::getCompressor() const
{
    return m_compressor;
}

// Build full path for a given filename under the base directory.
std::string FileManager::resolvePath(const std::string &filename) const
{
    fs::path basePath(environmentVariable);
    return (basePath / filename).string();
}

// Compress and write content to a file (thread-safe).
bool FileManager::writeCompressed(const std::string &filename, const std::string &content)
{
    std::lock_guard<std::mutex> lock(_fsMutex);

    std::string compressed = m_compressor.compress(content);
    std::string fullPath = resolvePath(filename);

    std::ofstream out(fullPath, std::ios::binary);
    if (!out.is_open())
    {
        return false;
    }

    out << compressed;
    return true;
}

// Read and return the raw compressed content of a file (thread-safe).
std::optional<std::string> FileManager::readCompressed(const std::string &filename)
{
    std::lock_guard<std::mutex> lock(_fsMutex);

    std::string fullPath = resolvePath(filename);
    std::ifstream in(fullPath, std::ios::binary);

    if (!in.is_open())
    {
        return std::nullopt;
    }

    std::ostringstream buffer;
    buffer << in.rdbuf();

    return buffer.str();
}

// Search text in all stored files (by filename or decompressed content).
std::vector<std::string> FileManager::searchInFiles(const std::string &search_text)
{
    std::lock_guard<std::mutex> lock(_fsMutex);

    std::vector<std::string> results;
    std::string base = getEnvironment();

    if (!fs::exists(base) || !fs::is_directory(base))
    {
        return results;
    }

    for (const auto &entry : fs::directory_iterator(base))
    {
        if (!entry.is_regular_file())
            continue;

        std::string filename = entry.path().filename().string();

        std::ifstream in(entry.path(), std::ios::binary);
        if (!in.is_open())
            continue;

        std::ostringstream buffer;
        buffer << in.rdbuf();
        std::string compressedContent = buffer.str();

        std::string decompressed;
        try
        {
            decompressed = m_compressor.decompress(compressedContent);
        }
        catch (...)
        {
            continue;
        }

        if (decompressed.find(search_text) != std::string::npos ||
            filename.find(search_text) != std::string::npos)
        {
            results.push_back(filename);
        }
    }

    return results;
}
