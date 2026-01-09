/**
 * Utility to convert a file object to a Base64 string.
 * @param {File} file - The file to convert.
 * @returns {Promise<string>} - The Base64 representation of the file.
 */
export const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};