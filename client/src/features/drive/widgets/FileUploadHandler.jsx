import React, { useRef, useImperativeHandle, forwardRef } from "react";

/**
 * A headless component that handles local file selection and processing.
 * It abstracts the FileReader API and provides a clean interface for the parent 
 * to trigger uploads and receive processed Base64 or text content.
 * * @param {Function} onFileProcessed - Callback receiving the structured file data.
 */
const FileUploadHandler = forwardRef(({ onFileProcessed }, ref) => {
    const fileInputRef = useRef(null);

    /**
     * Exposes the triggerUpload method to the parent component.
     * Allows dynamic setting of the 'accept' attribute
     */
    useImperativeHandle(ref, () => ({
        triggerUpload: (filter = "*/*") => {
            if (fileInputRef.current) {
                fileInputRef.current.accept = filter;
                fileInputRef.current.click();
            }
        }
    }));

    /**
     * Internal handler for the native input change event.
     * Manages reading logic based on whether the file is plain text or binary.
     */
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        const isTextFile = file.type === "text/plain" || file.name.endsWith(".txt");

        reader.onload = () => {
            const result = reader.result;

            if (result === null) {
                console.error("FileReader result is null");
                return;
            }

            let finalContent = "";

            if (isTextFile) {
                // Return text content as a raw string
                finalContent = result;
            } else {
                /**
                 * For binary files (images, PDFs, etc.), we extract the Base64 portion 
                 * by splitting the DataURL at the comma.
                 */
                const base64Parts = result.split(',');
                finalContent = base64Parts.length > 1 ? base64Parts[1] : result;
            }

            // Package the metadata and content for the parent
            onFileProcessed({
                name: file.name,
                content: finalContent,
                mimeType: file.type || (isTextFile ? "text/plain" : "application/octet-stream"),
                size: file.size,
                isText: isTextFile
            });
        };

        reader.onerror = (err) => {
            console.error("FileReader error:", err);
            alert("An error occurred while reading the file.");
        };

        // Determine the read strategy
        if (isTextFile) {
            reader.readAsText(file);
        } else {
            reader.readAsDataURL(file);
        }

        /** * Important: Reset the input value so the same file can be 
         * selected/processed again consecutively.
         */
        e.target.value = "";
    };

    return (
        <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
        />
    );
});

export default FileUploadHandler;