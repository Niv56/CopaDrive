/**
 * Implement Input Validation.
 * Validates that required fields exist in the request body.
 * If missing, throws a 400 Bad Request error.
 */
const validateFields = (body, requiredFields) => {
    for (const field of requiredFields) {
        if (!body[field]) {
            const error = new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
            error.status = 400;
            throw error;
        }
    }
};

/**
 * Implement Existence Checkers.
 * Checks if a resource exists in the repository.
 * If not found, throws a 404 Not Found error.
 */
const validateExistence = (resource, resourceName) => {
    if (!resource) {
        const error = new Error(`${resourceName} not found`);
        error.status = 404;
        throw error;
    }
};

module.exports = {
    validateFields,
    validateExistence,
};