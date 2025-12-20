#include "FileManager.h"
#include <cstdlib>
#include <fstream>
#include <filesystem>
#include <sstream>

namespace fs = std::filesystem;

FileManager::FileManager(const ICompressor &compressor)
    : m_compressor(compressor) {
    const char *envPath = std::getenv("PATH_DIR");
    this->environmentVariable = (envPath == nullptr) ? "." : envPath;

    fs::create_directories(environmentVariable);
}

std::string FileManager::resolvePath(const std::string &filename) const {
    return (fs::path(environmentVariable) / filename).string();
}

bool FileManager::write(const std::string &filename, const std::string &content) {
    std::lock_guard<std::mutex> lock(_fsMutex);
    std::ofstream out(resolvePath(filename), std::ios::binary);
    if (!out.is_open()) return false;
    out << content;
    return out.good();
}

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

bool FileManager::remove(const std::string &filename) {
    std::lock_guard<std::mutex> lock(_fsMutex);
    return fs::remove(resolvePath(filename));
}

bool FileManager::exists(const std::string &filename) const {
    std::lock_guard<std::mutex> lock(_fsMutex);
    return fs::exists(resolvePath(filename));
}

std::vector<std::string> FileManager::listFiles() const {
    std::lock_guard<std::mutex> lock(_fsMutex);
    std::vector<std::string> files;
    for (const auto &entry : fs::directory_iterator(environmentVariable)) {
        if (entry.is_regular_file()) files.push_back(entry.path().filename().string());
    }
    return files;
}

FileManager::CreateStatus FileManager::createIfAbsent(const std::string& filename,
                                                      const std::string& content) {
    std::lock_guard<std::mutex> lock(_fsMutex);

    const std::string fullPath = resolvePath(filename);
    if (fs::exists(fullPath)) {
        return CreateStatus::AlreadyExists;
    }

    std::ofstream out(fullPath, std::ios::binary | std::ios::out);
    if (!out.is_open()) return CreateStatus::IOError;

    out.write(content.data(), static_cast<std::streamsize>(content.size()));
    if (!out.good()) return CreateStatus::IOError;

    return CreateStatus::Created;
}
