# Collect all library sources and headers (recursively)
file(GLOB_RECURSE SRC_FILES "*.cpp" "*.h")
list(REMOVE_ITEM SRC_FILES "${CMAKE_CURRENT_SOURCE_DIR}/main.cpp")


# Build a static library from the project sources
add_library(CopaDriveLib STATIC ${SRC_FILES})

# Expose include path to dependents (tests, future CLI, etc.)
target_include_directories(CopaDriveLib PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})

# הוספת תיקיית commands לנתיבי החיפוש של הספרייה
target_include_directories(CopaDriveLib PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/commands)