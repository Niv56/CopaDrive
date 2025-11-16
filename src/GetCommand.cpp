#include "GetCommand.h"

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
