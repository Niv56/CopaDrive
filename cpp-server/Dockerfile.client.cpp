# Dockerfile.client.cpp - C++ client image

# C++ compiler image
FROM gcc:latest   

# Working directory inside container
WORKDIR /usr/src/client            

# Copy only the client source file (this is your C++ client program)
COPY . .

# Compile the client
RUN g++ -std=c++17 -O2 -Wall src/client_main.cpp -Isrc -Isrc/commands -o CopaDriveClient

# Run the client; IP + port come from docker run arguments
ENTRYPOINT ["./CopaDriveClient"]