// Create a random ID string.
const _makeRandomId = () => {
    return Math.random().toString(36).slice(2, 11);
};

/**
 * Generate a unique ID.
 */
const generateId = async (checkExists) => {
    let id;
    let attempts = 0;

    do {
        id = _makeRandomId();
        attempts++;
        
        if (attempts > 100) throw new Error("Unable to generate unique ID");

    } while (checkExists && (await checkExists(id)));

    return id;
};

module.exports = {
    generateId
};