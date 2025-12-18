const express = require('express');
const app = express();
const port = 3000; // System port as required by the API 

/**
 * Middleware to parse the request body as JSON.
 * Mandatory to ensure all /api/ endpoints return JSON.
 */
app.use(express.json());

// Basic test route to verify the server is running
app.get('/', (req, res) => {
    res.json({ message: "CopaDrive Web Server is running" });
});

/**
 * Start the server and listen on port 3000.
 * Server initialization is verified through the console log.
 */
app.listen(port, () => {
    console.log(`Web server listening at http://localhost:${port}`);
});