#ifndef FILEMANAGER_H
#define FILEMANAGER_H

#include <string>
#include <vector>
#include <optional>
#include <mutex>
#include "ICompressor.h"

class FileManager {
private:
    std::string environmentVariable;
    const ICompressor& m_compressor;
    mutable std::mutex _fsMutex;

    // Combines the environment path with the given filename to create a full system path
    std::string resolvePath(const std::string& filename) const;

public:
    // Initializes the FileManager with a reference to a compressor and sets the working directory
    FileManager(const ICompressor& compressor);

    // Provides access to the compressor for commands that need to handle data logic
    const ICompressor& getCompressor() const { return m_compressor; }

    // Writes raw content to a file. Thread-safe.
    bool write(const std::string& filename, const std::string& content);

    // Reads raw content from a file. Thread-safe.
    std::optional<std::string> read(const std::string& filename) const;

    // Deletes a file from the directory. Thread-safe.
    bool remove(const std::string& filename);

    // Checks if a specific file exists in the managed directory. Thread-safe.
    bool exists(const std::string& filename) const;

    // Retrieves a list of all regular filenames in the managed directory. Thread-safe.
    std::vector<std::string> listFiles() const;
};

#endif