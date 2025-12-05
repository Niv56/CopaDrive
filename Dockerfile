# Use a minimal compiler image (as in the slides)
FROM gcc:latest

# Install CMake
RUN apt-get update && apt-get install -y cmake && apt-get clean

# Install Threads
RUN apt-get update && \
    apt-get install -y libpthread-stubs0-dev netcat-openbsd telnet && \
    apt-get clean

# Copy the whole project into the container
COPY . /usr/src/mytest
WORKDIR /usr/src/mytest

# Delete old cmake
RUN rm -rf build

# Set an environment variable inside the Docker container
ENV PATH_DIR=/usr/src/mytest/storage
# Delete old file from the environment 
RUN rm -rf $PATH_DIR && mkdir -p $PATH_DIR
#Create the gile to save the files
RUN mkdir -p /usr/src/mytest/storage


# Configure and build the project
RUN mkdir -p build
WORKDIR /usr/src/mytest/build
RUN cmake .. && make

#Run main.cpp
ENTRYPOINT ["./ConsoleApp"]
CMD ["5555"]
