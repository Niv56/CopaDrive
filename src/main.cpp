#include "App.h"
#include "RLECompressor.h"
#include "ConsoleMenu.h"
#include <iostream>

int main() {
    
    // Create compressor and menu components.
    ICompressor* comp = new RLECompressor();
    IMenu* menu = new ConsoleMenu();

    // Build the app ocject with the given components.
    App app(comp, menu);
    
    // Start the main application loop.
    app.run();

    return 0;
}
