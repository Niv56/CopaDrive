cmake_minimum_required(VERSION 3.11)
project(CopaDrive LANGUAGES CXX)

# Use modern C++
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Enable CTest integration
include(CTest)
enable_testing()

# Bring GoogleTest using FetchContent (slide-style)
include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/refs/tags/v1.13.0.zip
)
# Helpful on Windows; harmless elsewhere
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

# Build library code and tests
add_subdirectory(src)
add_subdirectory(tests)

add_executable(ConsoleApp app/main.cpp)
target_link_libraries(ConsoleApp PRIVATE CopaDriveLib)

