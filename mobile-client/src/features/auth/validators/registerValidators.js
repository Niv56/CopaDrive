/**
 * Validation logic for the multi-step registration flow.
 * Each function returns an 'errors' object; if empty, the step is valid.
 */

export const validateStep1 = (data) => {
  const errors = {};
  if (!data.firstName || data.firstName.trim().length < 2) {
    errors.firstName = "First name is required (min 2 chars)";
  }
  return errors;
};

export const validateStep2 = (data) => {
  const errors = {};
  // Validates standard Israeli mobile format: 05X-XXX-XXXX
  if (data.phoneNumber && !/^05\d-?\d{3}-?\d{4}$/.test(data.phoneNumber)) {
    errors.phoneNumber = "Invalid Israeli phone number";
  }
  return errors;
};

export const validateStep3 = (data) => {
  const errors = {};
  if (!data.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
  if (!data.gender) errors.gender = "Gender is required";
  return errors;
};

export const validateStep4 = (data) => {
  const errors = {};

  // Organization-specific email validation
  if (!data.email || !data.email.includes("@")) {
    errors.email = "Invalid email address";
  } else if (!data.email.endsWith("@copa.com")) {
    errors.email = "Email must end with @copa.com";
  }

  if (!data.password || data.password.length < 8) {
    errors.password = "Password must be at least 8 chars";
  }

  // Cross-field validation for password matching
  if (data.password !== data.verifyPassword) {
    errors.verifyPassword = "Passwords do not match";
  }

  return errors;
};