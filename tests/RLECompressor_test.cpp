// tests/RLECompressor_test.cpp
#include <gtest/gtest.h>
#include "RLECompressor.h"

// בדיקה בסיסית – round-trip
TEST(RLECompressorTest, SimpleRoundTrip) {
    RLECompressor c;

    std::string original = "aaabccccdd";
    std::string compressed = c.compress(original);
    std::string decompressed = c.decompress(compressed);

    EXPECT_EQ(decompressed, original);
}

// קלט ריק
TEST(RLECompressorTest, EmptyString) {
    RLECompressor c;

    std::string original = "";
    std::string compressed = c.compress(original);
    std::string decompressed = c.decompress(compressed);

    EXPECT_EQ(decompressed, original);
}

// בלי חזרות
TEST(RLECompressorTest, NoRepeats) {
    RLECompressor c;

    std::string original = "abcdef";
    std::string compressed = c.compress(original);
    std::string decompressed = c.decompress(compressed);

    EXPECT_EQ(decompressed, original);
}
