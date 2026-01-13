import React from "react";
import ImageViewer from "../viewers/ImageViewer";

function ImageImporter({ name, setName, content, triggerUpload }) {
  return (
    <div className="image-importer-container text-center p-4">
      {!content ? (
        /* מצב א': לפני בחירת התמונה (Intermediate Screen) */
        <div className="selection-screen">
          <div className="mb-3">
            <i className="bi bi-camera-fill text-primary" style={{ fontSize: "3.5rem" }}></i>
          </div>
          <h4>Upload Picture</h4>
          <p className="text-muted">Select a photo from your computer</p>
          <button type="button" className="btn btn-primary" onClick={triggerUpload}>
            Choose Image
          </button>
        </div>
      ) : (
        /* מצב ב': אחרי הבחירה - תצוגת Preview (Review Screen) */
        <div className="review-screen text-start">
          
          {/* 🟢 הוספה: שורת כותרת עם כפתור החלפה */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="modal-label mb-0">Image Preview</label>
            <button 
              type="button" 
              className="btn btn-link btn-sm p-0 text-decoration-none" 
              onClick={triggerUpload}
            >
              Change Image
            </button>
          </div>

          <div className="preview-container mb-3" style={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden" }}>
             <ImageViewer file={{ name, content: `data:image/jpeg;base64,${content}` }} />
          </div>

          <label className="modal-label">Image Name</label>
          <input 
            type="text" 
            className="modal-input" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            autoFocus 
          />
        </div>
      )}
    </div>
  );
}

export default ImageImporter;