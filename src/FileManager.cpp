#include "FileManager.h"
#include "ICompressor.h"
#include <cstdlib>
#include <fstream>
#include <filesystem>

//constructor
    FileManager :: FileManager (const ICompressor& compressor): m_compressor(compressor)
    {
        //get an environment variable path
        const char* environment = std :: getenv ("PATH_DIR");
        //check if the getnec succeed
        if(environment == nullptr){
            throw std :: runtime_error ("The getenv method failed");
        }
        //set the path
        this->environmentVariable = environment;
    }

     void FileManager :: saveFile(const std :: string& filename, const std :: string& content){
        //copress the data 
        std :: string compressed = m_compressor.compress(content);
        //create the fullpath
        std:: string fullPath = environmentVariable +"/"+ filename;

        std::filesystem::create_directories(environmentVariable);

        //create new file and set the path.
        std :: ofstream MyFile(fullPath);
        //add the compressed content;
        MyFile << compressed;
        MyFile.close();
     }

     std :: string FileManager :: loadFile (const std :: string& filename){
          //create the fullpath
        std :: string fullPath = environmentVariable +"/"+ filename;
        std :: ifstream MyFile;
        //open the file
        MyFile.open(fullPath);
        //variable to wirte down the data from the file.
        std :: string content = "";

        //check if the file opmed
        if(MyFile.is_open()){
            std :: string nextLine;
            //every loop fet one line from the file.
            while (std::getline(MyFile,nextLine))
            {   
                content += nextLine;   
            }
            //decompress the data
            content = m_compressor.decompress(content);
            MyFile.close();
        }
       else 
            return ""; 
        return content;
     }

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
