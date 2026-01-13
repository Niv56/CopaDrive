const net = require('net');
const SERVER_PORT = process.env.CPP_SERVER_PORT || 5555;
const SERVER_HOST = process.env.CPP_SERVER_HOST || '127.0.0.1';

// Send a command to the TCP server and resolve with the response body (or reject on non-2xx).
const sendTcpCommand = (command) => {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        console.log(`[TCP Client] Connecting to: ${SERVER_HOST}:${SERVER_PORT}`);

        client.connect(SERVER_PORT, SERVER_HOST, () => {
            client.write(command + '\n');
            client.end();
        });

        let receivedData = '';

        client.on('data', (chunk) => {
            receivedData += chunk.toString();
        });

        client.on('end', () => {
            console.log("[TCP Client] Connection closed by server, parsing data...");

            const lines = receivedData.split('\n');
            if (lines.length === 0) return resolve('');

            const statusLine = lines[0].trim();
            const statusCode = parseInt(statusLine.split(' ')[0], 10);

            if (statusCode >= 200 && statusCode < 300) {
                const separatorIndex = lines.indexOf('');

                if (separatorIndex !== -1 && separatorIndex < lines.length - 1) {
                    const body = lines.slice(separatorIndex + 1).join('\n');
                    resolve(body);
                } else {
                    resolve('');
                }
            } else {
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
