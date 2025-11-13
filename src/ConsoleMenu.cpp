#include "ConsoleMenu.h"
#include <iostream>
#include <vector>

    //this method takes the command, and return vector with each part of the command.
    std :: vector<std :: string> ConsoleMenu :: nextCommand(){
       
        //implementation
        
        return {} ;
    }


    //this method recives from the user command.
    std :: string ConsoleMenu :: readInput(){

        std :: string  command << cin << endl;
    }

    //this method checks if the user input is correct according the format Coomand [filename] contant.
   bool ConsoleMenu ::validInput(std::string command){

        return false;
    }

    //this method split the command to vector according the command.
     std::vector<std::string> ConsoleMenu ::  splitCommand(std ::string command){

        return {};

    }

