#include "ConsoleMenu.h"
#include <iostream>
#include <vector>
#include <sstream>
#include <cctype>

    //this method takes the command, and return vector with each part of the command.
    std :: vector<std :: string> ConsoleMenu :: nextCommand(){
        std :: string command = readInput();
        std :: vector <std :: string> parts = splitCommand(command);
        if(validInput(parts)) 
            return parts ;
            else
            return {};
    }


    //this method recives from the user command.
    std :: string ConsoleMenu :: readInput(){
        std :: string  command;
        std ::getline(std :: cin,command);
        return command;
    }

    //this method split the command to vector according the command.
     std::vector<std::string> ConsoleMenu ::  splitCommand(std ::string command){
       //create new vector
        std :: vector<std::string> parts;

        std :: istringstream iss (command);

        std :: string first;
        if(!(iss>>first)){
            // in case there is no command 
            return parts;
        }
        //add new part to the end of the vector.
        parts.push_back(first);
        
        std :: string second;
        if(!(iss>> second)){
            // in case there is no command 
            return parts;
        }
        //add new part to the end of the vector.
        parts.push_back(second);

        //save the end of the sentence
        std :: string end;
        std :: getline (iss, end);
    
        //erase the ' ' befor the end part.
        if (!end.empty() && end[0] == ' ') {
            end.erase(0, 1); 
            }
        
        //add the last part to the vector.
        if (!end.empty()) {
            parts.push_back(end);
            }

            //in case the command is search join 2 parts of the contant to 1 part.
        if (command[0] == 's' || command[0] == 'S') {  
            if (parts.size() == 3 ) {
            parts[1] = parts[1] + " " + parts[2];
            parts.pop_back();
            }
        }
            //in case the command is add amd the user insert an empty file contant.
        if (command[0] == 'a' || command[0] == 'A') {  
            if (parts.size() == 2) {
            parts.push_back("");
            }
        }

        return parts;
    }

    //this method checks if the user input is correct according the format Coomand [filename] contant.
    bool ConsoleMenu :: validInput(std :: vector <std :: string> command) {
       //base case
        if(command.empty()) return false;
        if(command.size() == 1) return false;
         //switch to lowercase
        for(char &c :command[0]){
            c = std :: tolower(c);
        }

        //vladition for add command
        if(command[0] == "add"){
            if(command.size() == 3){
                return true;
            }
            else 
                return false;
        }

         if(command[0] == "get"){
            if(command.size() == 2){
                return true;
            }
           else 
                return false;
        }

             if(command[0] == "search"){
            if(command.size() == 2){
                return true;
            }
            else 
                return false;
        }
        return false;
    }
    




    