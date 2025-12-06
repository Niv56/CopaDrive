// CommandResult.cpp
#include <CommandResult.h>
#include <sstream>

// Initialization of the static StatusMessage map
const std::map<StatusCode, std::string> CommandResult :: StatusMassege ={
    {StatusCode::CREATED, "Creatrd"},
    {StatusCode::NO_CONTENT, "No Content"},
    {StatusCode::OK, "Ok"},
    {StatusCode::NOT_FOUND, "Not found"},
    {StatusCode::BAD_REQUEST, "Bad Request"},
    {StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error"}

};

std::string CommandResult::format(const CommandResult& result){
    std::stringstream response;

    // Build the status response (like "200 Ok")
    auto it = StatusMassege.find(result.status);
    if(it == StatusMassege.end()){
        response << 500 << " "<< "Internal Server Error";
    }else{
        response << static_cast<int>(result.status)<<" "<< it->second;
    }
    if(result.status == StatusCode::OK){
        response<<"\n\n"<< result.body;
    }
    return response.str();
}
