import React from 'react';
import { Copy, Download, Code, Check } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useBuilder } from '../../context/BuilderContext';
import { useToast } from '../../context/ToastContext';

export default function JsonExportModal({ isOpen, onClose }) {
  const { exportJsonConfig } = useBuilder();
  const toast = useToast();
  const jsonObject = exportJsonConfig();
  const jsonString = JSON.stringify(jsonObject, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    toast.success('JSON configuration copied to clipboard!');
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fanforge-config-${jsonObject.brand.id}.json`;
    a.click();
    toast.success('Downloaded templateConfig.json!');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export JSON Template Configuration" maxWidth="max-w-2xl">
      <div className="space-y-4">
        <p className="text-xs text-slate-500">
          This standardized JSON schema contains all brand color tokens, collectible item specifications, physics rules, and deployment output targets for the Phase 4 engine.
        </p>

        <div className="relative bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs max-h-96 overflow-y-auto border border-slate-800">
          <pre>{jsonString}</pre>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="secondary" icon={Copy} onClick={handleCopy}>
            Copy JSON
          </Button>
          <Button variant="primary" icon={Download} onClick={handleDownload}>
            Download JSON
          </Button>
        </div>
      </div>
    </Modal>
  );
}
