
// Internal helper - just creates the random string
const _makeRandomId = () => {
    return Math.random().toString(36).slice(2, 11);
};

/**
 * Generates a generic ID.
 * If provided, the generator will loop until a unique ID is found.
 */
const generateId = (checkExists) => {
    let id;
    let attempts = 0;
    
    do {
        id = _makeRandomId();
        attempts++;
        if (attempts > 100) throw new Error("Unable to generate unique ID");
    } while (checkExists && checkExists(id)); // Loop only if a checker is provided and returns true
    
    return id;
};

module.exports = {
    generateId
};