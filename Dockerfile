# Use a minimal compiler image (as in the slides)
FROM gcc:latest

# Install CMake
RUN apt-get update && apt-get install -y cmake && apt-get clean

# Copy the whole project into the container
COPY . /usr/src/mytest
WORKDIR /usr/src/mytest

# Delete old cmake
RUN rm -rf build

# Configure and build the project
RUN mkdir -p build
WORKDIR /usr/src/mytest/build
RUN cmake .. && make


########################################
# CMD options — switch by commenting/uncommenting
########################################

#Run main.cpp
CMD ["./ConsoleApp"]

# run the tests
# CMD ["./tests/runTests"]
