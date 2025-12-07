#ifndef FILEMANAGER_H
#define FILEMANAGER_H
#include <string>
#include "ICompressor.h"
#include <vector>
#include <optional>
#include <mutex>

// Manages all file-system access with compression and thread safety.
class FileManager {
private:
    std::string        environmentVariable;
    const ICompressor& m_compressor;
    static std::mutex  _fsMutex;

    // Build full path under the base directory.
    std::string resolvePath(const std::string& filename) const;

public:
    // Initialize with a concrete compressor and PATH_DIR base.
    FileManager(const ICompressor& compressor);

    // Base directory for all files (PATH_DIR or ".").
    const std::string& getEnvironment() const;

    // Compressor used for all read/write operations.
    const ICompressor& getCompressor() const;

    // Compress and write content into a file (thread-safe).
    bool writeCompressed(const std::string& filename, const std::string& content);

    // Read raw compressed content from a file (thread-safe).
    std::optional<std::string> readCompressed(const std::string& filename);

    // Search text across all stored files (thread-safe).
    std::vector<std::string> searchInFiles(const std::string& search_text);
};

#endif
