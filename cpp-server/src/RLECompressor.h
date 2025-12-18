#ifndef RLE_COMPRESSOR_H
#define RLE_COMPRESSOR_H

#include "ICompressor.h"
#include <string>

class RLECompressor : public ICompressor {
public:
    // Run-Length Encoding with safe format: <count>:<char_hex>;
    std::string compress(const std::string& input)const override;

    // Reverse of compress
    std::string decompress(const std::string& input)const override;
};

#endif
