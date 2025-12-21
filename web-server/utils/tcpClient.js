const net = require('net');
const SERVER_PORT = process.env.CPP_SERVER_PORT || 5555;
const SERVER_HOST = process.env.CPP_SERVER_HOST || '127.0.0.1';

/**
 * Sends a command to the C++ TCP Server and parses the response.
 * Protocol: 
 * 1. Send: COMMAND [ARGS...]\n
 * 2. Receive: STATUS LINE\n
 * 3. Receive: \n (Empty Separator)
 * 4. Receive: BODY... (Until connection close or end of transmission)
 * * @param {string} command - The command string (e.g., "GET <id>")
 * @returns {Promise<string>} - Resolves with the body of the response (if any)
 */
const sendTcpCommand = (command) => {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        console.log(`[TCP Client] Connecting to: ${SERVER_HOST}:${SERVER_PORT}`);
        
        client.connect(SERVER_PORT, SERVER_HOST, () => {
            // Send the command ending with a newline
            client.write(command + '\n');
            client.end();
        });

        let receivedData = '';

        client.on('data', (chunk) => {
            receivedData += chunk.toString();
        });

        client.on('end', () => {
            console.log("[TCP Client] Connection closed by server, parsing data...");
            // Parse the full response
            // Expected format: "200 OK\n\n<Content>"
            const lines = receivedData.split('\n');
            if (lines.length === 0) return resolve('');

            const statusLine = lines[0].trim();
            const statusCode = parseInt(statusLine.split(' ')[0], 10);

            // Check for success status codes (200 OK, 201 Created, 204 No Content)
            if (statusCode >= 200 && statusCode < 300) {
                // The body starts after the first blank line.
                // We find the index of the first empty line (separator)
                const separatorIndex = lines.indexOf(''); 
                
                if (separatorIndex !== -1 && separatorIndex < lines.length - 1) {
                    // Join everything after the separator
                    const body = lines.slice(separatorIndex + 1).join('\n');
                    resolve(body); // Resolve with content
                } else {
                    resolve(''); // No content
                }
            } else {
                // Handle errors (404, 400, 500)
                const error = new Error(statusLine);
                error.status = statusCode;
                reject(error);
            }
        });

        client.on('error', (err) => {
            console.error(`[TCP Client] Connection Error to ${SERVER_HOST}:`, err.message);
            const error = new Error('Storage server unavailable');
            error.status = 503;
            reject(error);
        });
    });
};

module.exports = { sendTcpCommand };