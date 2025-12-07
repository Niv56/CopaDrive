# CopaDrive



# Build the Docker:
docker compose build

# Run server
docker compose up server

# Run C++ Client
docker compose run --rm cpp-client

# Run Python Client
docker compose run --rm python-client

# Run Tests
docker compose run --rm test

# About the Application
CopaDrive is a TCP client–server app that stores RLE-compressed text files under a directory defined by PATH_DIR.
The C++ server is multi-threaded and can handle many clients in parallel.
We provide two clients, C++ & Python, both talk to the same server.
The App supports 4 case-insensitive commands.

## Commands
| Command                     | What it does                                   | Success response      |
|----------------------------|-----------------------------------------------|-----------------------|
| `POST <filename> <text>`   | Create/overwrite compressed file              | `201 Created`         |
| `GET <filename>`           | Print file contents                           | `200 Ok` + body       |
| `SEARCH <text>`            | List files whose name/content contains text   | `200 Ok` + file list  |
| `DELETE <filename>`        | Delete file                                   | `204 No Content`      |



# App Run Example

![Docker Build & Run](Images/1.png)

# Tests Run Example

![Docker Build & Run](Images/2.png)


# Reflection on Code Design and Open/Closed Principles

During the project we tried to code in a way that would be easy to extend later, following SOLID principles and loose coupling.
Still, there were several places where we had to change existing code, and we learned from that.

1. Moving from IMenu to IOHandler and CommandParser
   At the beginning, the IMenu interface did too many things: read input from the user, parsed the command, and passed it to App. This created unnecessary coupling between components that should not depend on each other.
   In the refactoring phase, we split it into two parts:
   IOHandler – responsible only for reading and writing through the socket.
   CommandParser – responsible only for parsing and validating the command.
   This made the code cleaner and reduced dependencies. 
   However, the change did require us to update several parts of the project. If we had designed it like this from the start, we would have avoided a lot of rewrite.

2. Changing Command Names
   When the command names changed, we had to update:
   the parser and App tests,
   the command map inside App.
   This shows that our design is not fully “closed for modification” when it comes to command names.
   But the good part is that the changes were limited to a few places and did not spread across all files.

3. Adding New Commands
   When adding a new command, we saw that the architecture worked well:
   We created a new class.
   We added  one line in App to register the new command.
   We add new validation to allow delete command.
   We didn't need to modify any existing command class. 
   This means the system is open for extension in this area, except for the single registration point in App.

4. Changing Command Output and Adding CommandResult
   This was the biggest change. At the first project, commands did not return anything—they just wrote directly to the client. Once we upgraded the protocol and added Status Codes, every command had to return a CommandResult.
   This required:
   changing the execute signature in the interface,
   updating every command implementation,
   updating App to send the formatted response back to the client.
   Although this was a large rewrite, it made the system much better for the future: now the output formatting is handled in one place, and command classes return only logical results.
   Any future protocol change will be much easier.

5. Thread Safety
   To make the code safety to thread, we started passing references instead of copies (mainly in App).
   This prevented issues with duplicate objects and made the design cleaner. 
   The change was small but important.

   Overall Summary
   Some changes required touching many files, but they improved the system’s design.
   Adding new commands required minimal changes in the code.
   Renaming commands still requires editing a few places, but not too many.
   Splitting IMenu into IOHandler and CommandParser made the system more organized and less coupled.
   In the end, even though some changes were not small, the code is now much more ready for the next tasks, and future updates will be easier to implement.

