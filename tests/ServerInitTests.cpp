#include <gtest/gtest.h>
#include "../src/ServerConfig.h"

// None digit input
TEST(ServerInitTests, InvalidPort_NotANumber) {
    EXPECT_THROW(ServerUtils::parsePort("xyz"), std::invalid_argument);
    EXPECT_THROW(ServerUtils::parsePort("55aa"), std::invalid_argument);
}

// None exsisting port
TEST(ServerInitTests, InvalidPort_OutOfRange_Low) {
    EXPECT_THROW(ServerUtils::parsePort("0"), std::out_of_range);
    EXPECT_THROW(ServerUtils::parsePort("-1"), std::invalid_argument); // המינוס לא נחשב digit
}

// None reasonable port
TEST(ServerInitTests, InvalidPort_OutOfRange_High) {
    EXPECT_THROW(ServerUtils::parsePort("70000"), std::out_of_range);
}

// Valid port for sanity
TEST(ServerInitTests, ValidPort) {
    EXPECT_NO_THROW({
        int p = ServerUtils::parsePort("5555");
        EXPECT_EQ(p, 5555);
    });
}