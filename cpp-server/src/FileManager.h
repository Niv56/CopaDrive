#ifndef FILEMANAGER_H
#define FILEMANAGER_H

#include <string>
#include <vector>
#include <optional>
#include <mutex>
#include "ICompressor.h"

class FileManager {
public:
    enum class CreateStatus {
        Created,
        AlreadyExists,
        IOError
    };

private:
    std::string environmentVariable;
    const ICompressor& m_compressor;
    mutable std::mutex _fsMutex;

    std::string resolvePath(const std::string& filename) const;

public:
    FileManager(const ICompressor& compressor);

    const ICompressor& getCompressor() const { return m_compressor; }

    bool write(const std::string& filename, const std::string& content);
    std::optional<std::string> read(const std::string& filename) const;
    bool remove(const std::string& filename);
    bool exists(const std::string& filename) const;
    std::vector<std::string> listFiles() const;

    // Atomic "create only if absent" under the same mutex (prevents race + overwrite)
    CreateStatus createIfAbsent(const std::string& filename, const std::string& content);
};

#endif
