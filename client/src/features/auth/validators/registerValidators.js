/** Validates required fields and length for step one */
export const validateStep1 = (formData) => {
    const errors = {};
    if (!formData.firstName.trim()) {
        errors.firstName = "Enter your first name";
    } else if (formData.firstName.trim().length < 2) {
        errors.firstName = "First name must be at least 2 characters";
    }
    return errors;
};

/** Validates phone number prefixes and maximum image size */
export const validateStep2 = (formData) => {
    const errors = {};
    const cleanPhone = formData.phoneNumber.replace(/\D/g, "");
    const blockedPrefixes = ["056", "057", "059"];

    if (!cleanPhone) {
        errors.phoneNumber = "Phone number is required";
    } else if (cleanPhone.length !== 10) {
        errors.phoneNumber = "Number must be exactly 10 digits";
    } else if (!cleanPhone.startsWith("05")) {
        errors.phoneNumber = "Must start with 05";
    } else if (blockedPrefixes.includes(cleanPhone.slice(0, 3))) {
        errors.phoneNumber = `Prefix ${cleanPhone.slice(0, 3)} is not supported`;
    }

    if (formData.image && formData.image.size > 5000000) {
        errors.image = "Image size must be less than 5MB";
    }

    return errors;
};

/** Validates birth date format, age range (10-120), and gender selection */
export const validateStep3 = (formData) => {
    const errors = {};
    const dobStr = String(formData.dateOfBirth || "").trim();
    const m = dobStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (!m) {
        errors.dateOfBirth = "Date of birth is required";
    } else {
        const yy = Number(m[1]);
        const currentYear = new Date().getFullYear();

        if (yy > currentYear - 10) {
            errors.dateOfBirth = "You must be at least 10 years old";
        } else if (yy < currentYear - 120) {
            errors.dateOfBirth = "Age cannot exceed 120 years";
        }
    }

    const allowed = new Set(["male", "female", "other", "prefer_not_to_say"]);
    if (!formData.gender || String(formData.gender).trim() === "") {
        errors.gender = "Gender is required";
    } else if (!allowed.has(formData.gender)) {
        errors.gender = "Invalid gender value";
    }

    return errors;
};

/** Validates mandatory domain, password complexity, and confirmation match */
export const validateStep4 = (formData) => {
    const errors = {};
    const email = (formData.email || "").trim().toLowerCase();

    if (!email) {
        errors.email = "Email is required";
    } else if (!email.endsWith("@copa.com")) {
        errors.email = "Only @copa.com accounts are permitted";
    } else if (!/^[^\s@]+@copa\.com$/.test(email)) {
        errors.email = "Enter a valid email username";
    }

    if (!formData.password) {
        errors.password = "Password is required";
    } else {
        const pwd = formData.password;
        if (pwd.length < 8 || !/[A-Z]/.test(pwd) || !/[a-z]/.test(pwd) || !/[0-9]/.test(pwd)) {
            errors.password = "Password does not meet requirements";
        }
    }

    if (formData.password !== formData.verifyPassword) {
        errors.verifyPassword = "Passwords don't match";
    }

    return errors;
};

export default registerValidators;