// Create a random ID string.
const _makeRandomId = () => {
    return Math.random().toString(36).slice(2, 11);
};

// Generate an ID (optionally ensure uniqueness via a checker callback).
const generateId = (checkExists) => {
    let id;
    let attempts = 0;

    do {
        id = _makeRandomId();
        attempts++;
        if (attempts > 100) throw new Error("Unable to generate unique ID");
    } while (checkExists && checkExists(id));

    return id;
};

module.exports = {
    generateId
};
