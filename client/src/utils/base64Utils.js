/**
 * base64Utils.js - Optimized version
 */

export const encodeTextToBase64 = (str) => {
  if (!str) return "";
  try {
    const bytes = new TextEncoder().encode(str);
    // שימוש ב-fromCodePoint/fromCharCode בצורה מרוכזת ליעילות
    const binString = String.fromCodePoint(...bytes);
    return btoa(binString);
  } catch (e) {
    console.error("Encoding error:", e);
    return "";
  }
};

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

export const base64ToBlob = (base64, mimeType = "application/octet-stream") => {
  try {
    // ניקוי אפשרי של הקידומת במקרה שנשלח Data URL מלא
    const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
    
    const binString = atob(cleanBase64);
    const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0));
    return new Blob([bytes], { type: mimeType });
  } catch (e) {
    console.error("Blob conversion error:", e);
    return null;
  }
};

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