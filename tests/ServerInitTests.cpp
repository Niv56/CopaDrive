#include <gtest/gtest.h>
#include "../src/ServerConfig.h"

// Validate that non-numeric input is rejected with invalid_argument.
TEST(ServerInitTests, InvalidPort_NotANumber) {
    EXPECT_THROW(ServerUtils::parsePort("xyz"), std::invalid_argument);
    EXPECT_THROW(ServerUtils::parsePort("55aa"), std::invalid_argument);
}

// Validate that ports below 1 are rejected (0 or negative values).
TEST(ServerInitTests, InvalidPort_OutOfRange_Low) {
    EXPECT_THROW(ServerUtils::parsePort("0"), std::out_of_range);
    EXPECT_THROW(ServerUtils::parsePort("-1"), std::invalid_argument); 
}

// Validate that ports above 65535 are rejected as out of range.
TEST(ServerInitTests, InvalidPort_OutOfRange_High) {
    EXPECT_THROW(ServerUtils::parsePort("70000"), std::out_of_range);
}

// Sanity check: a valid port string is parsed correctly without throwing.
TEST(ServerInitTests, ValidPort) {
    EXPECT_NO_THROW({
        int p = ServerUtils::parsePort("5555");
        EXPECT_EQ(p, 5555);
    });
}
