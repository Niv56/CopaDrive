const net = require('net');

const CPP_HOST = process.env.CPP_HOST || 'localhost';
const CPP_PORT = parseInt(process.env.CPP_PORT || '5555', 10);


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
        
        client.setTimeout(10000); 
        
        client.connect(CPP_PORT, CPP_HOST, () => {
            client.write(command + '\n');
        });
        
        client.on('data', (data) => {
            response += data.toString();
            
            const lines = response.split('\n');
            const statusLine = lines[0] || '';
            
            if (statusLine.startsWith('201') || statusLine.startsWith('204')) {
                cleanup();
                resolve('');
                return;
            }
            
            if (statusLine.startsWith('200')) {
               
                if (response.endsWith('\n\n') && response.length > statusLine.length + 2) {
                    cleanup();
                    const body = lines.slice(2).join('\n').trim();
                    resolve(body);
                    return;
                }
            }
            
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


 // Stores file content in C++ server
async function storeFile(fileId, content) {
    await sendCommand(`post ${fileId} ${content}`);
}


// Retrieves file content from C++ server 
async function getFile(fileId) {
    return await sendCommand(`get ${fileId}`);
}


// Deletes file from C++ server
async function deleteFile(fileId) {
    await sendCommand(`delete ${fileId}`);
}

module.exports = {
    storeFile,
    getFile,
    deleteFile
};