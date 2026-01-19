import React, { createContext, useContext, useState, useCallback } from "react";
import "./ToastContex.css"; 

const ToastContext = createContext(null);

/**
 * Toast Provider - Manages toast notifications globally
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "error", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}


export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}


function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === "error" ? "⚠️" : toast.type === "success" ? "✅" : "ℹ️"}
          </span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => onRemove(toast.id)}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastProvider;