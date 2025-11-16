// AddCommand.cpp
#include "AddCommand.h"

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