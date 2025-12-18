#include "SearchCommand.h"
#include "FileManager.h"
#include "CommandResult.h"
#include <filesystem>
#include <fstream>
#include <iostream>
#include <algorithm>
#include <cctype>

// Helper: return lowercase copy of a string (for case-insensitive search).
std::string toLowerCase(const std::string& str) {
    std::string lowerStr = str;
    std::transform(lowerStr.begin(), lowerStr.end(), lowerStr.begin(),
                   [](unsigned char c){ return std::tolower(c); });
    return lowerStr;
}

// Search across all stored files by content or filename (case-insensitive).
CommandResult SearchCommand::execute(const std::vector<std::string> &comand, FileManager &fm) {
    if (comand.size() != 2) {
        return CommandResult(StatusCode::BAD_REQUEST, "");
    }

    std::string queryLower = toLowerCase(comand[1]);
    std::vector<std::string> matches;
    const ICompressor& compressor = fm.getCompressor();

    // Safely retrieve the list of files via FileManager
    std::vector<std::string> allFiles = fm.listFiles();

    for (const std::string& fileName : allFiles) {
        // Logic 1: Search within the filename (Case-insensitive)
        if (toLowerCase(fileName).find(queryLower) != std::string::npos) {
            matches.push_back(fileName);
            continue; 
        }

        // Logic 2: Search within the content (Safe read and decompress)
        auto compressed = fm.read(fileName);
        if (compressed) {
            std::string decompressed = compressor.decompress(*compressed);
            if (toLowerCase(decompressed).find(queryLower) != std::string::npos) {
                matches.push_back(fileName);
            }
        }
    }

    if (matches.empty()) {
        return CommandResult(StatusCode::NOT_FOUND, "");
    }

    std::string result;
    for (size_t i = 0; i < matches.size(); ++i) {
        result += matches[i] + (i == matches.size() - 1 ? "" : "\n");
    }

    return CommandResult(StatusCode::OK, result);
}
