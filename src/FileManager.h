#ifndef FILEMANAGER_H
#define FILEMANAGER_H

#include <string>
#include "ICompressor.h"
#include <vector>
#include <optional>
#include <mutex>

class FileManager {
private:
    std::string environmentVariable;
    const ICompressor& m_compressor;
    
    static std::mutex _fsMutex;
    // Helper to resolve the full path
    std::string resolvePath(const std::string& filename) const;

public:
    FileManager(const ICompressor& compressor);

    // Return the environment path (PATH_DIR) as a const reference
    const std::string& getEnvironment() const;

    // Return the compressor used for compress/decompress
    const ICompressor& getCompressor() const;

    // Write content to a compressed file (Thread-Safe)
    bool writeCompressed(const std::string& filename, const std::string& content);

    // Read content from a compressed file (Thread-Safe)
    std::optional<std::string> readCompressed(const std::string& filename);

    // Search for text within files (Thread-Safe)
    std::vector<std::string> searchInFiles(const std::string& search_text);
};

#endif
