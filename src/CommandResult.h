//CommandResult.h
#ifndef COMMAND_RESULT_H
#define COMMAND_RESULT_H

#include <string>
#include <map>
#include <utility> 

enum class StatusCode {
    CREATED=201,
    NO_CONTENT=204,
    OK=200,
    NOT_FOUND = 404,
    BAD_REQUEST=400,
    INTERNAL_SERVER_ERROR = 500
};

struct CommandResult
{
    // The http cose status.
    StatusCode status;
    // The body of the data (for get and search).
    std::string body;

    static const std::map<StatusCode, std::string> StatusMassege;

    // Convert from CommandResult into string to able pass the info to the client.
    static std::string format (const CommandResult& result);
};



#endif