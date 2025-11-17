#include "ConsoleMenu.h"
#include <iostream>
#include <vector>
#include <sstream>
#include <cctype>

    std :: vector<std :: string> ConsoleMenu :: nextCommand(){

        std :: string command = readInput();
        std :: vector <std :: string> parts = splitCommand(command);
        if(validInput(parts)) 
            return parts ;
            else
            return {};
    }

    
    std :: string ConsoleMenu :: readInput(){
        std :: string  command;
        std ::getline(std :: cin,command);
        return command;
    }

     std::vector<std::string> ConsoleMenu ::  splitCommand(std ::string command){

        std :: vector<std::string> parts;

        // Create a string stream to parse the command using formatted extraction
        std :: istringstream iss (command);

        // Extract the command name.
        std :: string first;
        if(!(iss>>first)){
            return parts;
        }
        parts.push_back(first);
    
        // Extract the first argument.
        std :: string second;
        if(!(iss>> second)){
            return parts;
        }
        parts.push_back(second);

        // Extract everything left in the stream as the trailing argument.
        std :: string end;
        std :: getline (iss, end);
    
        // Clean up leading whitespace produced by getline().
        if (!end.empty() && end[0] == ' ') {
            end.erase(0, 1); 
            }
        
        // Add the trailing argument (if any) to the vector.
        if (!end.empty()) {
            parts.push_back(end);
            }

            // For 'search' command, merge the 2 last argument into a single argument.
        if (command[0] == 's' || command[0] == 'S') {  
            if (parts.size() == 3 ) {
            parts[1] = parts[1] + " " + parts[2];
            parts.pop_back();
            }
        }
            // For 'add' command, if only the filename is provifed, insert an empty file content.
        if (command[0] == 'a' || command[0] == 'A') {  
            if (parts.size() == 2) {
            parts.push_back("");
            }
        }

         // For 'get' command, merge the 2 last argument into a single argument.
        if (command[0] == 'g' || command[0] == 'G') {  
            if (parts.size() == 3 ) {
            parts[1] = parts[1] + " " + parts[2];
            parts.pop_back();
            }
        }

        return parts;
    }

    bool ConsoleMenu :: validInput(std :: vector <std :: string> command) {
       
        // Base case
        if(command.empty()) return false;
        if(command.size() == 1) return false;
         
        // Switch to lowercase
        for(char &c :command[0]){
            c = std :: tolower(c);
        }

        // 'add' expects exactly: add <filename> <content>
        if(command[0] == "add"){
            if(command.size() == 3){
                return true;
            }
            else 
                return false;
        }

        // 'get' expects exactly: get <filename> 
        if(command[0] == "get"){
            if(command.size() == 2){
                return true;
            }
           else 
                return false;
        }

        // 'search' expects exactly: search <content>
        if(command[0] == "search"){
            if(command.size() == 2){
                return true;
            }
            else 
                return false;
        }
        return false;
    }
    




    