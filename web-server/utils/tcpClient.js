const net = require('net');
const SERVER_PORT = process.env.CPP_SERVER_PORT || 5555;
const SERVER_HOST = process.env.CPP_SERVER_HOST || '127.0.0.1';


// Sends a command to the C++ TCP Server and parses the response
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
            const lines = receivedData.split('\n');
            if (lines.length === 0) return resolve('');

            const statusLine = lines[0].trim();
            const statusCode = parseInt(statusLine.split(' ')[0], 10);

            // Check for success status codes
            if (statusCode >= 200 && statusCode < 300) {
                // The body starts after the first blank line
                // We find the index of the first empty line
                const separatorIndex = lines.indexOf(''); 
                
                if (separatorIndex !== -1 && separatorIndex < lines.length - 1) {
                    // Join everything after the separator
                    const body = lines.slice(separatorIndex + 1).join('\n');
                    resolve(body); // Resolve with content
                } else {
                    resolve(''); // No content
                }
            } else {
                // Handle errors
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