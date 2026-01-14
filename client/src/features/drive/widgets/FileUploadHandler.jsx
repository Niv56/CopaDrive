import React, { useRef, useImperativeHandle, forwardRef } from "react";

const FileUploadHandler = forwardRef(({ onFileProcessed }, ref) => {
    const fileInputRef = useRef(null);

    // Expose trigger function to parent with optional MIME filter
    useImperativeHandle(ref, () => ({
        triggerUpload: (filter = "*/*") => {
            if (fileInputRef.current) {
                fileInputRef.current.accept = filter;
                fileInputRef.current.click();
            }
        }
    }));

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        const isTextFile = file.type === "text/plain" || file.name.endsWith(".txt");

        reader.onload = () => {
            const result = reader.result;
            
            // Safety check for empty or failed reads
            if (result === null) {
                console.error("FileReader result is null");
                return;
            }

            let finalContent = "";

            if (isTextFile) {
                // Keep text content as-is (even if empty string)
                finalContent = result;
            } else {
                // Extract Base64 string for binary files
                const base64Parts = result.split(',');
                finalContent = base64Parts.length > 1 ? base64Parts[1] : result;
            }

            // Send processed data to the parent component
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
            alert("Failed to read file from local disk.");
        };

        // Choose reading method based on file type
        if (isTextFile) {
            reader.readAsText(file);
        } else {
            reader.readAsDataURL(file);
        }

        // Reset input to allow selecting the same file again
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