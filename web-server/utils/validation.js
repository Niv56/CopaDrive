// Validates that required fields exist in the request body
const validateFields = (body, requiredFields) => {
  for (const field of requiredFields) {
    if (!body[field]) {
      const error = new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
      error.status = 400;
      throw error;
    }
  }
};

// Validates that a field is a non-empty string, throwing 400 if invalid
const validateNonEmptyString = (body, field, message) => {
  const value = body?.[field];
  if (typeof value !== 'string' || value.trim() === '') {
    const err = new Error(message || `${field} must be a non-empty string`);
    err.status = 400;
    throw err;
  }
};

// Checks if a resource exists, throwing 404 if not found
const validateExistence = (resource, resourceName) => {
  if (!resource) {
    const error = new Error(`${resourceName} not found`);
    error.status = 404;
    throw error;
  }
};

// Validates that the date of birth follows the YYYY-MM-DD format
const validateDateOfBirth = (body, field = 'dateOfBirth') => {
  validateNonEmptyString(body, field, `${field} must be a non-empty string`);

  const value = body[field].trim();
  const dobOk = /^\d{4}-\d{2}-\d{2}$/.test(value);

  if (!dobOk) {
    const error = new Error(`${field} must be in YYYY-MM-DD format`);
    error.status = 400;
    throw error;
  }
};

// Validates that the gender field contains an allowed value
const validateGender = (body, field = 'gender') => {
  validateNonEmptyString(body, field, `${field} must be a non-empty string`);

  const value = body[field].trim();
  const allowed = new Set(['male', 'female', 'other', 'prefer_not_to_say']);

  if (!allowed.has(value)) {
    const error = new Error(`${field} must be one of: male, female, other, prefer_not_to_say`);
    error.status = 400;
    throw error;
  }
};

module.exports = {
  validateFields,
  validateNonEmptyString,
  validateExistence,
  validateDateOfBirth,
  validateGender
};