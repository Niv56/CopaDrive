const net = require('net');

const CPP_HOST = process.env.CPP_SERVER_HOST || 'localhost';
const CPP_PORT = parseInt(process.env.CPP_SERVER_PORT || '5555', 10);

/**
 * Sends a command to the C++ server and returns the response.
 */
function sendCommand(command) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        let response = '';
        let resolved = false;
        
        const cleanup = () => {
            if (!resolved) {
                resolved = true;
                client.destroy();
            }
        };
        
        client.setTimeout(10000); // 10 second timeout
        
        client.connect(CPP_PORT, CPP_HOST, () => {
            client.write(command + '\n');
        });
        
        client.on('data', (data) => {
            response += data.toString();
            
            // Check if we have a complete response
            const lines = response.split('\n');
            const statusLine = lines[0] || '';
            
            // For 201 Created or 204 No Content - just status line is enough
            if (statusLine.startsWith('201') || statusLine.startsWith('204')) {
                cleanup();
                resolve('');
                return;
            }
            
            // For 200 OK - need status + blank + body + final blank
            if (statusLine.startsWith('200')) {
                // Response format: "200 Ok\n\n<body>\n\n" or "200 Ok\n\n\n" for empty
                // Wait until response ENDS with \n\n AND is longer than just "status\n\n"
                // "200 Ok\n\n" = statusLine.length + 2 chars, we need MORE than that
                if (response.endsWith('\n\n') && response.length > statusLine.length + 2) {
                    cleanup();
                    // Extract body: skip status line and first blank line
                    const body = lines.slice(2).join('\n').trim();
                    resolve(body);
                    return;
                }
                // Keep waiting for more data...
            }
            
            // For 400/404/500 errors - just status line
            if (statusLine.startsWith('400') || statusLine.startsWith('404') || statusLine.startsWith('500')) {
                cleanup();
                reject(new Error(`C++ server error: ${statusLine}`));
                return;
            }
        });
        
        client.on('timeout', () => {
            cleanup();
            reject(new Error('C++ server connection timeout'));
        });
        
        client.on('error', (err) => {
            cleanup();
            reject(err);
        });
        
        client.on('close', () => {
            if (!resolved) {
                // Connection closed before we got a valid response
                if (response) {
                    const statusLine = response.split('\n')[0] || '';
                    reject(new Error(`C++ server closed unexpectedly: ${statusLine}`));
                } else {
                    reject(new Error('C++ server closed connection'));
                }
            }
        });
    });
}

/**
 * Stores file content in C++ server
 */
async function storeFile(fileId, content) {
    // Ensure content is a string and not empty/undefined
    const safeContent = content || '';
    // C++ server does not support overwrite; delete first, then post.
    try {
        await sendCommand(`delete ${fileId}`);
    } catch (err) {
        // Ignore 404 (file may not exist yet). Re-throw other errors.
        if (!err.message?.includes('404')) {
            throw err;
        }
    }

    await sendCommand(`post ${fileId} ${safeContent}`);
}

/**
 * Retrieves file content from C++ server
 */
async function getFile(fileId) {
    return await sendCommand(`get ${fileId}`);
}

/**
 * Deletes file from C++ server
 */
async function deleteFile(fileId) {
    await sendCommand(`delete ${fileId}`);
}

module.exports = {
    storeFile,
    getFile,
    deleteFile
};