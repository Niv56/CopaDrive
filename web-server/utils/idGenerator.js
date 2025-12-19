
// Implement ID Generator Utility.
// Generate a random unique string (9 characters)
const generateId = () => {
    // We use .slice(2, 11) instead of .substr to follow modern JS standards
    return Math.random().toString(36).slice(2, 11);
};

module.exports = { generateId };