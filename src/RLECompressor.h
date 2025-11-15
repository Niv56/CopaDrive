#ifndef RLE_COMPRESSOR_H
#define RLE_COMPRESSOR_H

#include "ICompressor.h"

class RLECompressor : public ICompressor {
public:
    // Run-Length Encoding: aaabb -> 3a2b
    std::string compress(const std::string& input) const override;

    // Reverse of compress: 3a2b -> aaabb
    std::string decompress(const std::string& input)const override;
};

#endif
