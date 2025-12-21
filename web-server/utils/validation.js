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

module.exports = {
    validateFields
};