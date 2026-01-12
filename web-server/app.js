require('dotenv').config();
const { getProvider } = require("./storage/storageProvider");
console.log("Provider:", getProvider().name);

console.log("JWT_SECRET exists?", !!process.env.JWT_SECRET);

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

const fileRoutes = require('./routes/fileRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const searchRoutes = require('./routes/searchRoutes');

app.use(cors());
<<<<<<< HEAD

// Parse JSON and URL-encoded bodies for all endpoints.
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
=======
// Global middleware to parse JSON bodies. Required for all API endpoints.
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
>>>>>>> ca3ba26 (upload files + loading ring)

// Log method + path for every incoming request.
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Health check route.
app.get('/', (req, res) => {
    res.json({ message: "CopaDrive Web Server is running" });
});

app.use('/api/users', userRoutes);
app.use('/api/tokens', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/search', searchRoutes);

// Return 404 JSON for undefined routes.
app.use((req, res) => {
    res.status(404).json({ error: "Resource not found" });
});

// Global error handler (always returns JSON).
app.use((err, req, res, next) => {
    console.error(err.stack);

    let statusCode = err.status || 500;
    let errorMessage = err.message || "Internal Server Error";

    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        statusCode = 400;
        errorMessage = "Invalid JSON format";
    }

    res.status(statusCode).json({
        error: errorMessage,
        status: statusCode
    });
});

// Start the web server.
app.listen(port, () => {
    console.log(`Web server listening at http://localhost:${port}`);
});
