#include <gtest/gtest.h>
#include "RLECompressor.h"

// Basic round-trip test
TEST(RLECompressorTest, SimpleRoundTrip) {
    RLECompressor c;

    std::string original = "aaabccccdd";
    std::string compressed = c.compress(original);
    std::string decompressed = c.decompress(compressed);

    EXPECT_EQ(decompressed, original);
}

// Empty input should stay empty
TEST(RLECompressorTest, EmptyString) {
    RLECompressor c;

    std::string original = "";
    std::string compressed = c.compress(original);
    std::string decompressed = c.decompress(compressed);

    EXPECT_EQ(decompressed, original);
}

// No repeats at all
TEST(RLECompressorTest, NoRepeats) {
    RLECompressor c;

    std::string original = "abcdef";
    std::string compressed = c.compress(original);
    std::string decompressed = c.decompress(compressed);

    EXPECT_EQ(decompressed, original);
}

// Only digits (e.g. "11111")
TEST(RLECompressorTest, OnlyDigits) {
    RLECompressor c;

    std::string original = "11111";
    std::string compressed = c.compress(original);
    std::string decompressed = c.decompress(compressed);

    EXPECT_EQ(decompressed, original);
}

// Digits mixed with letters (e.g. "a11b22")
TEST(RLECompressorTest, DigitsAndLetters) {
    RLECompressor c;

    std::string original = "a11b22";
    std::string compressed = c.compress(original);
    std::string decompressed = c.decompress(compressed);

    EXPECT_EQ(decompressed, original);
}

// Only spaces
TEST(RLECompressorTest, OnlySpaces) {
    RLECompressor c;

    std::string original = "     ";  // 5 spaces
    std::string compressed = c.compress(original);
    std::string decompressed = c.decompress(compressed);

    EXPECT_EQ(decompressed, original);
}

// Only symbols / punctuation
TEST(RLECompressorTest, OnlySymbols) {
    RLECompressor c;

    std::string original = "!@#$%%^^&&";
    std::string compressed = c.compress(original);
    std::string decompressed = c.decompress(compressed);

    EXPECT_EQ(decompressed, original);
}
// Weird inputs – digits, spaces, symbols, mixed content – must still round-trip
TEST(RLECompressorTest, WeirdInputsRoundTrip) {
    RLECompressor c;

    std::vector<std::string> cases = {
        "11111",          // only digits, repeated
        "1234567890",     // only digits, no repeats
        "     ",          // only spaces
        "!!!@@@",         // only special characters
        "a1b2c3",         // mix of letters and digits
        "file_name.txt",  // letters, underscore, dot
        " , , , ",        // spaces + commas
        "AaBbCc",         // mix of upper/lower case
        " 123 abc !! ",   // spaces + digits + letters + symbols
        ""                // empty string
    };

    for (const auto& original : cases) {
        std::string compressed = c.compress(original);
        std::string decompressed = c.decompress(compressed);

        EXPECT_EQ(decompressed, original) 
            << "Round-trip failed for input: '" << original << "'";
    }
}