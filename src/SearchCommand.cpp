#include "SearchCommand.h"
#include "FileManager.h"
#include "CommandResult.h"
#include <filesystem>
#include <fstream>
#include <iostream>
#include <algorithm>
#include <cctype>

// --- Helper Function: Case-Insensitive Conversion ---
std::string toLowerCase(const std::string& str) {
    std::string lowerStr = str;
    std::transform(lowerStr.begin(), lowerStr.end(), lowerStr.begin(),
                   [](unsigned char c){ return std::tolower(c); });
    return lowerStr;
}

CommandResult SearchCommand::execute(const std::vector<std::string> &comand, FileManager &fm)
{

    // Not enough arguments for 'search'
    if (comand.size() != 2)
    {
        return CommandResult(StatusCode::BAD_REQUEST, "");
    }

    // Extract filename for clearer name.
    const std::string &textToSearch = comand[1];

    // Convert search term to lowercase once
    std::string textToSearchLower = toLowerCase(textToSearch);

    const std::string &basePath = fm.getEnvironment();
    const ICompressor &compressor = fm.getCompressor();

    // List of files matching the search term
    std::vector<std::string> filesName;

    try
    {
        // Iterate over all files in the storage directory
        for (const auto &entry : std::filesystem::directory_iterator(basePath))
        {

            // Ignore non-file entries
            if (!entry.is_regular_file())
            {
                continue;
            }

            std::string fileName = entry.path().filename().string();
            std::string fullPath = basePath + "/" + fileName;

            // If file can't be opened, ignore it
            std::ifstream myFile(fullPath);
            if (!myFile.is_open())
            {
                return CommandResult(StatusCode::INTERNAL_SERVER_ERROR, "");
            }

            std::string compressed;
            std::string nextLine;
            // Read compressed file content line by line
            while (std::getline(myFile, nextLine))
            {
                compressed += nextLine;
            }
            myFile.close();
            // Expand the compressed data back to original text
            std::string contentDecompressed = compressor.decompress(compressed);

            // Convert content and filename to lowercase for comparison
            std::string contentLower = toLowerCase(contentDecompressed);
            std::string fileNameLower = toLowerCase(fileName);

            // Check if the file content contains the search term (using lowercase versions)
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

    std::string files = "";
    // Insert all matching filenames into string
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
