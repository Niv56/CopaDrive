# Dockerfile.client.cpp - C++ client image

# C++ compiler image
FROM gcc:latest   

# Working directory inside container
WORKDIR /usr/src/client            

# Copy only the client source file (this is your C++ client program)
COPY src/client_main.cpp .

# Compile the client
RUN g++ -std=c++17 -O2 -Wall client_main.cpp -o CopaDriveClient

# Run the client; IP + port come from docker run arguments
ENTRYPOINT ["./CopaDriveClient"]
