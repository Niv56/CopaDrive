// This controller handles the business logic for user registration.
exports.registerUser = (req, res, next) => {
    try {
        // Validation: Check if the required 'username' field exists in the request body.
        if (!req.body.username) {
            const error = new Error("Username is required");
            error.status = 400; // Standardized HTTP status for Client Error
            throw error; // Throwing error moves execution to the catch block
        }
        
        // If registration is successful, return a 201 Created status with a JSON response.
        res.status(201).json({ message: "User registered successfully" });

    } catch (err) {
        // Ensures the Centralized Error Handler formats the response as JSON.
        next(err);
    }
};