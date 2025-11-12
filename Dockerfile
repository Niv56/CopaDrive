# Use a minimal compiler image (as in the slides)
FROM gcc:latest

# Install CMake (some gcc:latest tags already include it; we ensure it exists)
RUN apt-get update && apt-get install -y cmake && apt-get clean

# Copy the whole project into the container
COPY . /usr/src/mytest
WORKDIR /usr/src/mytest

# Configure and build the project during image build
RUN mkdir -p build
WORKDIR /usr/src/mytest/build
RUN cmake .. && make

# Run the GoogleTest binary when the container starts
CMD ["./tests/runTests"]
