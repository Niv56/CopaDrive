# Collect all library sources and headers (recursively)
file(GLOB_RECURSE SRC_FILES "*.cpp" "*.h")

# Build a static library from the project sources
add_library(CopaDriveLib ${SRC_FILES})

# Expose include path to dependents (tests, future CLI, etc.)
target_include_directories(CopaDriveLib PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})
