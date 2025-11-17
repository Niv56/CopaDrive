#include "App.h"
#include "RLECompressor.h"
#include "ConsoleMenu.h"
#include <iostream>

int main() {
    ICompressor* comp = new RLECompressor();
    IMenu*       menu = new ConsoleMenu();

    App app(comp, menu);
    app.run();

    return 0;
}
