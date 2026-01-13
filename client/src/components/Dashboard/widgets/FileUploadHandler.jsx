import React, { useRef, useImperativeHandle, forwardRef } from "react";

/**
 * FileUploadHandler - אחראי על ממשק בחירת הקבצים מהמחשב.
 * מעודכן לתמיכה בקבצים ריקים (0 bytes) והפרדה בין טקסט לבינארי.
 */
const FileUploadHandler = forwardRef(({ onFileProcessed }, ref) => {
    const fileInputRef = useRef(null);

    // חשיפת פונקציית ה-trigger לאבא דרך ה-Ref
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

        console.log(`[HANDLER] Selected: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}`);

        const reader = new FileReader();

        // בדיקה האם הקובץ הוא טקסט (לפי MIME type או סיומת)
        const isTextFile = file.type === "text/plain" || file.name.endsWith(".txt");

        reader.onload = () => {
            // 🛠️ תיקון: אם הקובץ ריק, ה-result הוא מחרוזת ריקה ("")
            // אנחנו מוודאים שזה לא null (שגיאה) אלא פשוט תוכן ריק
            const result = reader.result;
            
            if (result === null) {
                console.error("[HANDLER] Error: reader.result is null!");
                return;
            }

            let finalContent = "";

            if (isTextFile) {
                // עבור קבצי טקסט (גם אם הם ריקים), נשמור את המחרוזת כפי שהיא
                finalContent = result;
                console.log(`[HANDLER] Read Text. Content Length: ${finalContent.length}`);
            } else {
                // עבור קבצים בינאריים, נחלץ את ה-Base64
                const base64Parts = result.split(',');
                finalContent = base64Parts.length > 1 ? base64Parts[1] : result;
                console.log(`[HANDLER] Read Base64. Data Length: ${finalContent.length}`);
            }

            // שליחת המידע המלא לאבא (CreateItem)
            onFileProcessed({
                name: file.name,
                content: finalContent, // עשוי להיות "" אם הקובץ ריק
                mimeType: file.type || (isTextFile ? "text/plain" : "application/octet-stream"),
                size: file.size,
                isText: isTextFile
            });
        };

        reader.onerror = (err) => {
            console.error("[HANDLER] FileReader error:", err);
            alert("Failed to read file from local disk.");
        };

        // בחירת מתודת הקריאה המתאימה
        if (isTextFile) {
            reader.readAsText(file);
        } else {
            reader.readAsDataURL(file);
        }

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

export default FileUploadHandler;