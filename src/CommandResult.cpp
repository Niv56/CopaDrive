// CommandResult.cpp
#include "CommandResult.h"
#include <sstream>

// Initialization of the static StatusMessage map
const std::map<StatusCode, std::string> CommandResult::StatusMassege = {
    {StatusCode::CREATED,"Created"},
    {StatusCode::NO_CONTENT,"No Content"},
    {StatusCode::OK,"Ok"},
    {StatusCode::NOT_FOUND,"Not Found"},
    {StatusCode::BAD_REQUEST,"Bad Request"},
    {StatusCode::INTERNAL_SERVER_ERROR,"Internal Server Error"}
};

std::string CommandResult::format(const CommandResult& result) {
    std::stringstream response;

    // Build the status response
    auto it = StatusMassege.find(result.status);
    if (it == StatusMassege.end()) {
        response << 500 << " " << "Internal Server Error";
    } else {
        response << static_cast<int>(result.status) << " " << it->second;
    }

    // For 200 OK we also add body after blank line
    if (result.status == StatusCode::OK) {
        response << "\n\n" << result.body;
    }

    return response.str();
}
