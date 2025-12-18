FROM gcc:latest

# Install basic tools
RUN apt-get update && apt-get install -y cmake libpthread-stubs0-dev netcat-openbsd telnet && apt-get clean

# Copy the project (from the cpp-server context)
COPY . /usr/src/mytest
WORKDIR /usr/src/mytest

# Cleaning and rebuilding
RUN rm -rf build && mkdir -p build
RUN mkdir -p /usr/src/mytest/storage

# Define environment variable for storage path
ENV PATH_DIR=/usr/src/mytest/storage

WORKDIR /usr/src/mytest/build
RUN cmake .. && make

# Run the server (Ensure binary name matches your CMakeLists.txt)
ENTRYPOINT ["./ConsoleApp"]
CMD ["5555"]