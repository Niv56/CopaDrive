// FileManager.h
#ifndef FILEMANAGER_H
#define FILEMANAGER_H

#include <string>
#include "ICompressor.h"

class FileManager {
private:
    std::string environmentVariable;
    const ICompressor& m_compressor;

public:

    FileManager(const ICompressor& compressor);

    // Return the environment path (PATH_DIR) as a const reference
    const std::string& getEnvironment() const;

    // Return the compressor used for compress/decompress
    const ICompressor& getCompressor() const;
};

#endif
