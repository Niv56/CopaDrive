#include "ConsoleMenu.h"
#include <iostream>


int main(){
    ConsoleMenu menu;
    while (true)
    {
        std :: vector <std :: string> cmd = menu.nextCommand();
    }
    
    return 0;
}