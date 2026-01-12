import React from "react";

function ImageViewer({ file }) {
  // בניית ה-Src: אם זה כבר DataURL או שצריך להוסיף Prefix של Base64
  const imageSrc = file.content.startsWith('data:') 
    ? file.content 
    : `data:${file.mimeType};base64,${file.content}`;

  return (
    <div className="viewer-container text-center">
      <img 
        src={imageSrc} 
        alt={file.name} 
        style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '8px' }} 
      />
    </div>
  );
}

export default ImageViewer;