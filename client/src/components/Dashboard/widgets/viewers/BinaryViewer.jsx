import React from "react";
import {
  BsFileEarmarkWordFill, BsFileEarmarkExcelFill, BsFileEarmarkPptFill,
  BsFileEarmarkPdfFill, BsFileEarmarkImageFill, BsFileEarmarkPlayFill,
  BsFileEarmarkMusicFill, BsFileEarmarkZipFill, BsFileEarmarkCodeFill,
  BsFileEarmarkTextFill, BsFileEarmarkFill
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

function BinaryViewer({ file }) {
  return (
    <div className="viewer-container text-center p-5 d-flex flex-column align-items-center justify-content-center h-100">
      <div className="mb-4 icon-wrapper-floating">
        {getFileIcon(file.name, file.mimeType, 120)}
      </div>

      <h3 className="mt-2 fw-bold file-name-display">{file.name}</h3>
      <p className="mb-0 opacity-50">No preview available for this file type</p>
      {/*  -Download     */}
    </div>
  );
}

export default BinaryViewer;