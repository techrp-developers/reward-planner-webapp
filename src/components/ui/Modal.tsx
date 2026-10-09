import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import CloseIcon from '@mui/icons-material/Close';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg', showClose = true }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-2xl z-10 overflow-hidden transform transition-all animate-scale-up max-h-[85vh] flex flex-col my-auto`}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            {title && <h3 className="text-lg font-bold text-gray-900">{title}</h3>}
            {showClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors ml-auto cursor-pointer"
              >
                <CloseIcon sx={{ fontSize: 20 }} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
