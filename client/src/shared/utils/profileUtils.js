// Generates a default SVG profile picture based on user initials
export const generateDefaultProfilePicture = (firstName, lastName = '') => {
    const initials = (firstName.charAt(0) + (lastName ? lastName.charAt(0) : '')).toUpperCase();

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

    const svg = `
        <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="60" fill="${backgroundColor}"/>
            <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
                  font-family="Roboto, Arial, sans-serif" font-size="48" font-weight="400" fill="white">
                ${initials}
            </text>
        </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Returns the uploaded image as Base64 or generates a default one if none provided
export const getProfilePicture = async (uploadedImage, firstName, lastName = '') => {
    if (uploadedImage) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(uploadedImage);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    } else {
        return generateDefaultProfilePicture(firstName, lastName);
    }
};

// Validates image file size (max 5MB) and allowed file types
export const validateProfilePicture = (file) => {
    if (!file) {
        return { valid: true, error: null };
    }

    if (file.size > 5000000) {
        return { valid: false, error: "Image size must be less than 5MB" };
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        return { valid: false, error: "Please upload a valid image file (JPEG, PNG, GIF, or WebP)" };
    }

    return { valid: true, error: null };
};