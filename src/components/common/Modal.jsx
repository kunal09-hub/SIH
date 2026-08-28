import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl', subtitle }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className={`relative w-full ${maxWidth} rounded-xl border border-enterprise-border bg-white shadow-xl p-5 sm:p-6 z-10 my-4 sm:my-8 max-h-[92vh] overflow-y-auto transform transition-all`}>
        <div className="flex items-start justify-between pb-4 border-b border-enterprise-border">
          <div>
            <h3 className="text-lg font-bold text-enterprise-text tracking-wide flex items-center gap-2">
              {title}
            </h3>
            {subtitle && <p className="text-sm text-enterprise-text-secondary mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-enterprise-text-muted hover:text-enterprise-text rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 max-h-[75vh] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
}
