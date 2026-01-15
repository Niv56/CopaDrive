/**
 * Encodes a UTF-8 string to a Base64 string.
 */
export const encodeTextToBase64 = (str) => {
  if (!str) return "";
  try {
    const bytes = new TextEncoder().encode(str);
    const binString = String.fromCodePoint(...bytes);
    return btoa(binString);
  } catch (e) {
    console.error("Encoding error:", e);
    return "";
  }
};

/**
 * Decodes a Base64 string back to a UTF-8 string.
 */
export const decodeBase64ToText = (base64) => {
  if (!base64) return "";
  try {
    const binString = atob(base64);
    const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0));
    return new TextDecoder().decode(bytes);
  } catch (e) {
    console.error("Decoding error:", e);
    return "Error: Could not decode text content.";
  }
};

/**
 * Converts a Base64 string into a Blob object.
 */
export const base64ToBlob = (base64, mimeType = "application/octet-stream") => {
  try {
    const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
    const binString = atob(cleanBase64);
    const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0));
    return new Blob([bytes], { type: mimeType });
  } catch (e) {
    console.error("Blob conversion error:", e);
    return null;
  }
};

/**
 * Reads a File or Blob and resolves to its Base64 string.
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!(file instanceof File || file instanceof Blob)) {
      reject(new Error("Input is not a file"));
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) => reject(error);
  });
};