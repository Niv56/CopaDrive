/**
 * Profile Picture Utility Functions
 * Handles default profile picture generation and management
 */

/**
 * Generates a default profile picture based on user's initials
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name (optional)
 * @returns {string} - SVG data URL for default profile picture
 */
export const generateDefaultProfilePicture = (firstName, lastName = '') => {
    // Get initials (max 2 characters)
    const initials = (firstName.charAt(0) + (lastName ? lastName.charAt(0) : '')).toUpperCase();

    // Generate a consistent color based on the name
    const colors = [
        '#1a73e8', // Copa Blue
        '#34a853', // Copa Green
        '#ea4335', // Copa Red
        '#fbbc04', // Copa Yellow
        '#ff6d00', // Orange
        '#9334e6', // Purple
    ];

    const colorIndex = (firstName.charCodeAt(0) + (lastName ? lastName.charCodeAt(0) : 0)) % colors.length;
    const backgroundColor = colors[colorIndex];

    // Create SVG
    const svg = `
        <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="60" fill="${backgroundColor}"/>
            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
                  font-family="Roboto, Arial, sans-serif" font-size="48" font-weight="400" fill="white">
                ${initials}
            </text>
        </svg>
    `;

    // Convert SVG to base64 data URL
    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Gets the profile picture - either uploaded or default
 * @param {File|null} uploadedImage - The uploaded image file
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name (optional)
 * @returns {Promise<string>} - Base64 string of the profile picture
 */
export const getProfilePicture = async (uploadedImage, firstName, lastName = '') => {
    if (uploadedImage) {
        // If user uploaded an image, convert it to base64
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(uploadedImage);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    } else {
        // If no image uploaded, return default profile picture
        return generateDefaultProfilePicture(firstName, lastName);
    }
};

/**
 * Validates if the uploaded image is acceptable
 * @param {File} file - The image file
 * @returns {Object} - { valid: boolean, error: string|null }
 */
export const validateProfilePicture = (file) => {
    if (!file) {
        return { valid: true, error: null }; // No file is okay
    }

    // Check file size (max 5MB)
    if (file.size > 5000000) {
        return { valid: false, error: "Image size must be less than 5MB" };
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        return { valid: false, error: "Please upload a valid image file (JPEG, PNG, GIF, or WebP)" };
    }

    return { valid: true, error: null };
};