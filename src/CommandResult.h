#ifndef COMMAND_RESULT_H
#define COMMAND_RESULT_H
#include <string>
#include <map>
#include <utility> 

// Status codes used in the server responses.
enum class StatusCode {
    CREATED               = 201,
    NO_CONTENT            = 204,
    OK                    = 200,
    NOT_FOUND             = 404,
    BAD_REQUEST           = 400,
    INTERNAL_SERVER_ERROR = 500
};

// Holds the result of executing a single command.
struct CommandResult
{
    StatusCode   status; // response code
    std::string  body;   // optional text body (GET / SEARCH)

    CommandResult(StatusCode s, const std::string& b) : status(s), body(b) {}

    static const std::map<StatusCode, std::string> StatusMessage;

    // Builds the status line string (e.g. "200 Ok").
    static std::string format(const CommandResult& result);
};

#endif
