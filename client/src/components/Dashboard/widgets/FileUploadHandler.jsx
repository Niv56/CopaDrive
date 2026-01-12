import { useRef, useImperativeHandle, forwardRef } from "react";

const FileUploadHandler = forwardRef(({ onFileProcessed }, ref) => {
    const fileInputRef = useRef(null);

    // מאפשר לאבא (CreateItem) להפעיל את הלחצן הנסתר
    useImperativeHandle(ref, () => ({
        triggerUpload: () => {
            fileInputRef.current.click();
        }
    }));

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        const isText = file.type === "text/plain" || file.name.endsWith(".txt");

        reader.onload = () => {
            let finalContent;

            // 1. עיבוד התוכן בהתאם לסוג הקובץ
            if (isText) {
                // עבור קבצי טקסט - שמירה כמחרוזת נקייה
                finalContent = reader.result;
            } else {
                // עבור קבצים בינאריים - חילוץ ה-Base64 ללא ה-Metadata של הדפדפן
                finalContent = reader.result.split(',')[1];
            }

            // 2. שליחת המידע המלא לקומפוננטת האב (CreateItem)
            onFileProcessed({
                name: file.name,
                content: finalContent,
                // התיקון הקריטי: שומרים את ה-mimeType האמיתי כדי שהשרת יכיר את הפורמט
                mimeType: file.type || (isText ? "text/plain" : "application/octet-stream"),
                size: file.size
            });
        };

        if (isText) {
            reader.readAsText(file); // קריאה כטקסט פשוט
        } else {
            reader.readAsDataURL(file); // קריאה כ-Base64
        }

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