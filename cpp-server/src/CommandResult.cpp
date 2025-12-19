#include "CommandResult.h"
#include <sstream>

// Maps each status code to its human-readable message.
const std::map<StatusCode, std::string> CommandResult::StatusMessage = {
    {StatusCode::CREATED,               "Created"},
    {StatusCode::NO_CONTENT,            "No Content"},
    {StatusCode::OK,                    "Ok"},
    {StatusCode::NOT_FOUND,             "Not Found"},
    {StatusCode::BAD_REQUEST,           "Bad Request"},
    {StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error"}
};

// Builds the status line string: "<code> <message>" (e.g. "200 Ok").
std::string CommandResult::format(const CommandResult& result) {
    std::stringstream response;

    auto it = StatusMessage.find(result.status);
    if (it == StatusMessage.end()) {
        response << 500 << " " << "Internal Server Error";
    } else {
        response << static_cast<int>(result.status) << " " << it->second;
    }

    return response.str();
}
