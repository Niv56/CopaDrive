const net = require('net');

const CPP_HOST = process.env.CPP_HOST || 'localhost';
const CPP_PORT = parseInt(process.env.CPP_PORT || '5555', 10);

/**
 * Sends a command to the C++ server and returns the response
 */
function sendCommand(command) {
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        let response = '';
        
        client.connect(CPP_PORT, CPP_HOST, () => {
            client.write(command + '\n');
        });
        
        client.on('data', (data) => {
            response += data.toString();
        });
        
        client.on('end', () => {
            const lines = response.trim().split('\n');
            const statusLine = lines[0];
            
            if (statusLine.startsWith('200')) {
                resolve(lines.slice(2).join('\n')); // Skip status and blank line
            } else if (statusLine.startsWith('201')) {
                resolve('');
            } else if (statusLine.startsWith('204')) {
                resolve('');
            } else {
                reject(new Error(`C++ server error: ${statusLine}`));
            }
        });
        
        client.on('error', (err) => {
            reject(err);
        });
    });
}

/**
 * Stores file content in C++ server
 */
async function storeFile(fileId, content) {
    await sendCommand(`post ${fileId} ${content}`);
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