import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg', subtitle }) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Box (Compact White Surface, max-height 85vh) */}
      <div className={`relative w-[calc(100%-24px)] sm:w-full ${maxWidth} max-h-[85vh] flex flex-col rounded-2xl border border-[#E2E8F0] bg-white shadow-2xl p-5 sm:p-6 z-10 my-auto transform transition-all`}>
        <div className="flex items-start justify-between pb-3.5 border-b border-[#E2E8F0] shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#172033] tracking-tight flex items-center gap-2">
              {title}
            </h3>
            {subtitle && <p className="text-xs text-[#64748B] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#64748B] hover:text-[#172033] rounded-lg hover:bg-[#F1F5F9] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 overflow-y-auto pr-1 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
