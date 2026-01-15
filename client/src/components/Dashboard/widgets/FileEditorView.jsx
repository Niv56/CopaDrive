import React, { useState } from "react";

function FileEditorView({ file, initialData, folders, onSave, onCancel }) {
  const [localData, setLocalData] = useState(initialData);
  
  const isTxt = localData.mimeType === "text/plain" || localData.name.toLowerCase().endsWith(".txt");
  const isImage = localData.mimeType.startsWith("image/") || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(localData.name);
  const isFolder = file.type === "folder";

  const handleFileChange = (e) => {
    const newFile = e.target.files[0];
    if (!newFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target.result;
      const finalContent = result.split(',')[1]; 

      setLocalData(prev => ({
        ...prev,
        content: finalContent,
        mimeType: newFile.type,
        name: newFile.name
      }));
    };
    reader.readAsDataURL(newFile);
  };

  return (
    <div className="file-editor">
      <div className="mb-3">
        <label className="form-label fw-bold">FILE NAME</label>
        <input 
          type="text" 
          className="form-control" 
          value={localData.name} 
          onChange={(e) => setLocalData({ ...localData, name: e.target.value })} 
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold">LOCATION</label>
        <select 
          className="form-select" 
          value={localData.parentId || ""} 
          onChange={(e) => setLocalData({ ...localData, parentId: e.target.value || null })}
        >
          <option value="">Root (My Drive)</option>
          {folders.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>

      {isTxt && (
        <div className="mb-3">
          <label className="form-label fw-bold">EDIT CONTENT</label>
          <textarea
            className="form-control"
            rows="10"
            value={localData.content}
            onChange={(e) => setLocalData({ ...localData, content: e.target.value })}
            style={{ 
              fontFamily: "monospace", 
              resize: "none",
              backgroundColor: "#fcfcfc"
            }}
          />
        </div>
      )}

      {!isFolder && !isTxt && (
        <div className="replace-content-section border rounded p-3 bg-light mt-4">
          <h6 className="fw-bold mb-3">Replace with File</h6>
          
          {isImage && localData.content && (
            <div className="current-image-preview mb-3 text-center border rounded p-2 bg-white">
              <div className="text-muted small mb-2">CURRENT IMAGE</div>
              <img 
                src={`data:${localData.mimeType};base64,${localData.content}`} 
                alt="Current preview" 
                style={{ maxWidth: "100%", maxHeight: "200px", objectFit: "contain" }} 
              />
            </div>
          )}

          <input 
            type="file" 
            className="form-control" 
            onChange={handleFileChange} 
            accept={isImage ? "image/*" : "*/*"} 
          />
          <div className="form-text mt-2">
            Upload a new file to replace the current content. The file name and type will be updated automatically.
          </div>
        </div>
      )}

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button className="btn btn-outline-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn btn-success" onClick={() => onSave(localData)}>Save Changes</button>
      </div>
    </div>
  );
}

export default FileEditorView;