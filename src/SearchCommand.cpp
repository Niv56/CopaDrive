#include "SearchCommand.h"

         std :: vector <std :: string > FileManager :: search (const std :: string& content){
            //create vector to save the files name whice contain the content
            std :: vector <std :: string> filesName;
            try {
                 // Create a directory iterator for the environmentVariable
                for (const auto& entry : std::filesystem::directory_iterator(environmentVariable)) {
                    //directory_iterator can return not only files, so we checked if entry is file.
                    if(entry.is_regular_file()){
                        //get the file name
                        std:: string fileName = entry.path().filename().string();
                        std:: string contentDecompressed = loadFile(fileName);
                        // check if the content contain the user content request.
                        if(contentDecompressed.find(content) != std :: string :: npos){
                            filesName.push_back(fileName);
                        }
                    }
                }
                } catch (const std::filesystem::filesystem_error& e) {}
                return filesName;
            }
