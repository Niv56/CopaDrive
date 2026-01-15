import React, { useMemo } from "react";
import { 
  BsFileEarmarkWordFill, BsFileEarmarkExcelFill, BsFileEarmarkPptFill, 
  BsFileEarmarkPdfFill, BsFileEarmarkImageFill, BsFileEarmarkPlayFill, 
  BsFileEarmarkMusicFill, BsFileEarmarkZipFill, BsFileEarmarkCodeFill, 
  BsFileEarmarkTextFill, BsFileEarmarkFill,
  BsCloudUpload 
} from "react-icons/bs";

const getFileIcon = (name, mimeType, size = 24) => {
  const ext = name ? name.split('.').pop().toLowerCase() : "";
  const mime = mimeType || "";

  if (['doc', 'docx', 'odt'].includes(ext) || mime.includes('word')) return <BsFileEarmarkWordFill size={size} color="#4285f4" />;
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext) || mime.includes('spreadsheet') || mime.includes('excel')) return <BsFileEarmarkExcelFill size={size} color="#34a853" />;
  if (['ppt', 'pptx', 'odp'].includes(ext) || mime.includes('presentation') || mime.includes('powerpoint')) return <BsFileEarmarkPptFill size={size} color="#f4b400" />;
  if (ext === 'pdf' || mime === 'application/pdf') return <BsFileEarmarkPdfFill size={size} color="#ea4335" />;
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext) || mime.startsWith('image/')) return <BsFileEarmarkImageFill size={size} color="#ea4335" />;
  if (['mp4', 'mkv', 'avi', 'mov'].includes(ext) || mime.startsWith('video/')) return <BsFileEarmarkPlayFill size={size} color="#ea4335" />;
  if (['mp3', 'wav', 'ogg'].includes(ext) || mime.startsWith('audio/')) return <BsFileEarmarkMusicFill size={size} color="#a142f4" />;
  if (['zip', 'rar', '7z', 'tar'].includes(ext) || mime.includes('zip') || mime.includes('compressed')) return <BsFileEarmarkZipFill size={size} color="#fbbc04" />;
  if (['js', 'jsx', 'html', 'css', 'json', 'py', 'java', 'c', 'cpp'].includes(ext)) return <BsFileEarmarkCodeFill size={size} color="#4285f4" />;
  if (ext === 'txt' || mime === 'text/plain') return <BsFileEarmarkTextFill size={size} color="#4285f4" />;
  return <BsFileEarmarkFill size={size} color="#9aa0a6" />;
};

function FileImporter({ name, content, mimeType, triggerUpload }) {
  const isText = mimeType?.startsWith("text/") || name?.toLowerCase().endsWith(".txt");
  const isImage = mimeType?.startsWith("image/");

  const textPreview = useMemo(() => {
    if (!isText || !content) return "";
    try { return window.atob(content); } catch (e) { return content; }
  }, [content, isText]);

  return (
    <div className="file-importer h-100 d-flex flex-column">
      <div className="preview-box flex-grow-1 d-flex align-items-center justify-content-center p-3" 
           style={{ minHeight: "200px", position: "relative" }}>
        
        {content ? (
          <div className="w-100 text-center">
            {isImage && (
              <img src={`data:${mimeType};base64,${content}`} alt="preview" className="img-fluid rounded shadow-sm" style={{ maxHeight: "250px" }} />
            )}

            {isText && (
              <div className="text-preview-wrapper text-start bg-white p-3 border rounded" style={{ maxHeight: "250px", overflowY: "auto" }}>
                <pre style={{ margin: 0, fontSize: "0.85rem", whiteSpace: "pre-wrap" }}>{textPreview}</pre>
              </div>
            )}

            {!isImage && !isText && (
              <div className="no-preview py-4">
                <div className="mb-3">
                   {getFileIcon(name, mimeType, 80)}
                </div>
                <strong className="d-block mb-1" style={{ fontSize: "1.1rem" }}>{name}</strong>
                <span className="opacity-75 small">No preview available</span>
              </div>
            )}
            
            <div className="mt-3">
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={triggerUpload}>
                Change file
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center w-100">
            <button 
              className="btn btn-primary btn-lg rounded-pill px-4 py-2 shadow-sm d-flex align-items-center gap-2 mx-auto"
              onClick={triggerUpload}
            >
               <BsCloudUpload size={22} />
               <span>Choose File</span>
            </button>
            <p className="mt-3 mb-0 small opacity-75">or drag and drop file here</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileImporter;