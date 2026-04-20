import { X } from 'lucide-react';
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]`}>
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-black text-gray-800">{title}</h2>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4.5 h-4.5 text-gray-400" />
          </button>
        </div>
        <div className="p-4 sm:p-5 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
