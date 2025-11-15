#ifndef ICOMPRESSOR_H
#define ICOMPRESSOR_H

#include <string>

class ICompressor {
public:
    // Compress raw text into compressed form
    virtual std::string compress(const std::string& input) const = 0;

    // Restore original text from compressed form
    virtual std::string decompress(const std::string& input) const = 0;

    virtual ~ICompressor() = default;
};

#endif
