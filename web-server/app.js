const express = require('express');
const app = express();
const port = 3000;
const fileRoutes = require('./routes/fileRoutes');
// Global middleware to parse JSON bodies. Required for all API endpoints.
app.use(express.json());

// Basic Request Logging. Logs the HTTP Method and Path to the console for every incoming request.
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes'); 

// Basic test route from previous story
app.get('/', (req, res) => {
    res.json({ message: "CopaDrive Web Server is running" });
});

app.use('/api/users', userRoutes);
app.use('/api/tokens', authRoutes); 
app.use('/api/files', fileRoutes);

/**
 * Global 404 Not Found handler.
 * Ensures that undefined routes return a 404 status with a JSON body,
 * as required by the API standardization rules.
 */
app.use((req, res) => {
    res.status(404).json({ error: "Resource not found" });
});

// Global Error Middleware.
app.use((err, req, res, next) => {
    // Log the full error stack for developer debugging
    console.error(err.stack);

    // SCRUM-147: Determine status code. Use 400 for JSON errors, or 500 as default.
    let statusCode = err.status || 500;
    let errorMessage = err.message || "Internal Server Error";

    // Specific check for SCRUM-137: Malformed JSON
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        statusCode = 400;
        errorMessage = "Invalid JSON format";
    }

    // Ensure response is ALWAYS a JSON object (SCRUM-118 Requirement)
    res.status(statusCode).json({
        error: errorMessage,
        status: statusCode
    });
});

app.listen(port, () => {
    console.log(`Web server listening at http://localhost:${port}`);
});