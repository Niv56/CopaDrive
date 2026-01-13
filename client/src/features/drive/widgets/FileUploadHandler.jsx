import React, { useRef, useImperativeHandle, forwardRef } from "react";

/**
 * FileUploadHandler - אחראי על ממשק בחירת הקבצים מהמחשב.
 * משתמש ב-forwardRef כדי לאפשר לאבא (CreateItem) להפעיל את הבחירה מרחוק.
 */
const FileUploadHandler = forwardRef(({ onFileProcessed }, ref) => {
    const fileInputRef = useRef(null);

    // 🛠️ חשיפת פונקציית ה-trigger לאבא דרך ה-Ref
    useImperativeHandle(ref, () => ({
        triggerUpload: (filter = "*/*") => {
            if (fileInputRef.current) {
                console.log(`[HANDLER] Opening file explorer with filter: ${filter}`);
                fileInputRef.current.accept = filter;
                fileInputRef.current.click();
            }
        }
    }));

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 🔍 לוג בדיקה: האם הדפדפן רואה גודל קובץ? (לפתרון בעיית ה-0 בייטים)
        console.log(`[HANDLER] Selected file: ${file.name}, Size: ${file.size} bytes`);

        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result;
            if (!result) {
                console.error("[HANDLER] Error: reader.result is empty!");
                return;
            }

            // חילוץ ה-Base64 בצורה בטוחה מה-DataURL
            const base64Parts = result.split(',');
            const base64Content = base64Parts.length > 1 ? base64Parts[1] : "";

            // לוג לווידוא שהקריאה לזיכרון הצליחה
            console.log(`[HANDLER] Read complete. Base64 length: ${base64Content.length}`);

            onFileProcessed({
                name: file.name,
                content: base64Content,
                mimeType: file.type || "application/octet-stream",
                size: file.size
            });
        };

        reader.onerror = (err) => {
            console.error("[HANDLER] FileReader error:", err);
            alert("Failed to read file from local disk.");
        };
        
        // התחלת קריאת הקובץ לזיכרון כ-Base64
        reader.readAsDataURL(file);

        // איפוס האינפוט כדי לאפשר בחירה חוזרת של אותו קובץ
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

// 🟢 קריטי: ייצוא Default כדי ש-CreateItem יוכל לייבא אותו ללא סוגריים מסולסלים
export default FileUploadHandler;