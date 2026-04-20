import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = true
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center text-center p-1 space-y-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDanger ? 'bg-rose-100 text-rose-500' : 'bg-indigo-100 text-indigo-500'}`}>
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-[15px] font-black text-gray-900 mb-1">{title}</h3>
          <p className="text-[11px] font-medium text-gray-500 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-2 w-full mt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-50 text-gray-600 font-black text-[11px] uppercase tracking-wider rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-2 font-black text-[11px] uppercase tracking-wider rounded-xl text-white transition-all shadow-md active:scale-95 ${
              isDanger 
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-100' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
