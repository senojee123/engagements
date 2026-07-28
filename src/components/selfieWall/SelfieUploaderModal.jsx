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
  const [selectedPhoto, setSelectedPhoto] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
  );
  const [isScanning, setIsScanning] = useState(false);

  const samplePhotos = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  ];

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
          <label className="block text-xs font-semibold text-slate-700 mb-2">Select Sample Photo</label>
          <div className="grid grid-cols-5 gap-2">
            {samplePhotos.map((url, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedPhoto(url)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  selectedPhoto === url ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200'
                }`}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
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
