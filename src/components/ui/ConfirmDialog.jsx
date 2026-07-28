import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'danger',
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 mt-2 mb-6">{description}</p>
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="outline" onClick={onClose} isDisabled={isLoading} className="w-full">
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} isLoading={isLoading} className="w-full">
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
