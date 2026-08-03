import React, { useState } from 'react';
import { Camera, UploadCloud, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useSelfieWall } from '../../context/SelfieWallContext';
import { useToast } from '../../context/ToastContext';

export default function SelfieUploaderModal({ isOpen, onClose }) {
  const { uploadSelfie, activeBrand } = useSelfieWall();
  const toast = useToast();

  const [uploaderName, setUploaderName] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 480;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          setSelectedPhoto(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsScanning(true);

    setTimeout(() => {
      const created = uploadSelfie({
        uploaderName: uploaderName || 'Fan Guest',
        caption: caption || `${activeBrand.name} Stadium Fan!`,
        photoUrl: selectedPhoto,
      });

      setIsScanning(false);
      if (created.status === 'approved') {
        toast.success(`Photo approved by AI & broadcast live to Jumbotron!`);
      } else {
        toast.info(`Photo submitted to FanForge Moderation Queue!`);
      }
      onClose();
      setUploaderName('');
      setCaption('');
    }, 1000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Fan Selfie to Big Screen"
      subtitle="Simulate mobile phone fan upload with AI safety scan"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Fan / Contestant Name"
          placeholder="e.g. Alex Morgan"
          value={uploaderName}
          onChange={(e) => setUploaderName(e.target.value)}
          required
        />

        <Input
          label="Fan Caption / Message"
          placeholder="e.g. Loving the game with Coca-Cola! 🥤"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">Upload Photo File</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
          />
        </div>

        {/* Selected Photo Preview Box */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-300 bg-slate-900">
          <img src={selectedPhoto} alt="Selected" className="w-full h-full object-cover" />
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold text-white flex items-center gap-1.5 border border-white/20">
            <img src={activeBrand.logo} alt="" className="w-3.5 h-3.5 object-contain" />
            <span>{activeBrand.name} Frame Overlay Applied</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={UploadCloud} disabled={isScanning}>
            {isScanning ? 'AI Scanning Image...' : 'Send to Moderation Queue'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
