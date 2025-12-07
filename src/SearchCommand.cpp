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
CommandResult SearchCommand::execute(const std::vector<std::string> &comand, FileManager &fm)
{
    if (comand.size() != 2)
    {
        return CommandResult(StatusCode::BAD_REQUEST, "");
    }

    const std::string &textToSearch = comand[1];
    std::string textToSearchLower   = toLowerCase(textToSearch);

    const std::string &basePath     = fm.getEnvironment();
    const ICompressor &compressor   = fm.getCompressor();

    std::vector<std::string> filesName;

    try
    {
        // Scan all regular files under PATH_DIR.
        for (const auto &entry : std::filesystem::directory_iterator(basePath))
        {
            if (!entry.is_regular_file())
                continue;

            std::string fileName = entry.path().filename().string();
            std::string fullPath = basePath + "/" + fileName;

            std::ifstream myFile(fullPath);
            if (!myFile.is_open())
            {
                return CommandResult(StatusCode::INTERNAL_SERVER_ERROR, "");
            }

            std::string compressed;
            std::string nextLine;
            while (std::getline(myFile, nextLine))
            {
                compressed += nextLine;
            }
            myFile.close();

            std::string contentDecompressed = compressor.decompress(compressed);

            std::string contentLower  = toLowerCase(contentDecompressed);
            std::string fileNameLower = toLowerCase(fileName);

            // Match either in file content or filename.
            if (contentLower.find(textToSearchLower) != std::string::npos ||
                fileNameLower.find(textToSearchLower) != std::string::npos)
            {
                filesName.push_back(fileName);
            }
        }
    }
    catch (const std::filesystem::filesystem_error &e)
    {
        return CommandResult(StatusCode::INTERNAL_SERVER_ERROR, "");
    }

    std::string files;
    for (const auto &name : filesName)
    {
        if (!files.empty())
        {
            files += "\n";
        }
        files += name;
    }

    if (files.empty())
    {
        return CommandResult(StatusCode::NOT_FOUND, files);
    }
    else
    {
        return CommandResult(StatusCode::OK, files);
    }
}
