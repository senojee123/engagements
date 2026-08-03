import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Plus, Edit2, Sparkles, CheckCircle2, Trash2, Upload, Image } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { fetchBrandKits, createBrandKitApi, deleteBrandKitApi } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export default function BrandManager() {
  const navigate = useNavigate();
  const toast = useToast();
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchBrandKits()
      .then((data) => {
        if (!cancelled) setBrands(data);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // FanZone Customization State
  const DEFAULT_FANZONE = {
    headerTitle: 'FAN ZONE',
    headerSubtitle: 'Fan experiences go live throughout the match',
    headerLogo: '',
    poweredByText: '',
    poweredByLogo: '',
  };

  const [fanZoneSettings, setFanZoneSettings] = useState(() => {
    const saved = localStorage.getItem('fanforge_fanzone_settings');
    return saved ? { ...DEFAULT_FANZONE, ...JSON.parse(saved) } : DEFAULT_FANZONE;
  });

  const handleSaveFanZoneSettings = () => {
    localStorage.setItem('fanforge_fanzone_settings', JSON.stringify(fanZoneSettings));
    try {
      const channel = new BroadcastChannel('fanforge_fanzone_sync');
      channel.postMessage({ type: 'FANZONE_SETTINGS_UPDATED', payload: fanZoneSettings });
      channel.close();
    } catch (e) {}
    toast.success('FanZone branding & sponsor logo updated!');
  };

  const handlePoweredByFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image file size should be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (typeof dataUrl === 'string') {
          setFanZoneSettings((prev) => ({ ...prev, poweredByLogo: dataUrl }));
          toast.success('Powered By sponsor logo uploaded!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeaderLogoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image file size should be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (typeof dataUrl === 'string') {
          setFanZoneSettings((prev) => ({ ...prev, headerLogo: dataUrl }));
          toast.success('Header logo uploaded!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
    primaryColor: '#4F46E5',
    secondaryColor: '#FFFFFF',
    accentColor: '#06B6D4',
    collectibleName: 'Brand Token',
    collectibleIcon: '💎',
  });

  const handleLogoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image file size should be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (typeof dataUrl === 'string') {
          setFormData((prev) => ({ ...prev, logo: dataUrl }));
          toast.success('Logo image uploaded successfully!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateBrand = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      const newBrand = await createBrandKitApi({
        name: formData.name,
        logo: formData.logo,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        accentColor: formData.accentColor,
        collectibleName: formData.collectibleName,
        collectibleIcon: formData.collectibleIcon,
        obstacleName: 'Hazard Trap',
        obstacleIcon: '⚠️',
        powerUpName: 'Super Booster',
        powerUpIcon: '⚡',
        runnerSprite: '🏃🏻‍♂️',
        tagline: 'Custom Brand Activation',
        bgGradient: 'from-indigo-950 via-slate-900 to-indigo-900',
        audioTheme: 'Upbeat Stadium Pop',
      });

      setBrands([newBrand, ...brands]);
      toast.success(`Brand Kit "${formData.name}" created!`);
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Unable to create brand kit.');
    }
  };

  const handleDeleteBrand = async () => {
    if (!brandToDelete) return;
    setIsDeleting(true);
    try {
      await deleteBrandKitApi(brandToDelete.id);
      setBrands(brands.filter((b) => b.id !== brandToDelete.id));
      toast.success(`Brand Kit "${brandToDelete.name}" deleted!`);
      setBrandToDelete(null);
    } catch (err) {
      toast.error(err.message || 'Unable to delete brand kit.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Brand Engine Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Brand Kit Manager</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create and maintain brand assets, color tokens, and collectible presets for automated template transformation.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={Plus}>
          Create Brand Kit
        </Button>
      </div>

      {/* Brand Kits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {brands.map((brand) => (
          <Card key={brand.id} hoverEffect className="flex flex-col justify-between overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 p-2.5 flex items-center justify-center border border-slate-800 shadow-sm">
                  <img src={brand.logo} alt={brand.name} className="max-h-full object-contain" />
                </div>
                <Badge variant="indigo" size="sm">
                  Preset
                </Badge>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">{brand.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5 italic">{brand.tagline}</p>
              </div>

              {/* Color Swatches */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block">Color Tokens</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: brand.primaryColor }} />
                    <span className="text-[10px] font-mono text-slate-600">{brand.primaryColor}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: brand.accentColor }} />
                    <span className="text-[10px] font-mono text-slate-600">{brand.accentColor}</span>
                  </div>
                </div>
              </div>

              {/* Collectible Preview */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{brand.collectibleIcon}</span>
                  <span className="font-semibold text-slate-900">{brand.collectibleName}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Collectible</span>
              </div>
            </CardContent>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                icon={Edit2}
                onClick={() => navigate('/library')}
              >
                Browse
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={Trash2}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                onClick={() => setBrandToDelete(brand)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* FanZone Mobile Portal Customization Card */}
      <Card className="border-indigo-200 bg-gradient-to-br from-white via-indigo-50/30 to-slate-50">
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">FanZone Mobile Portal Customization</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Customize the mobile FanZone header, "Powered By" sponsor logo, and sponsor tagline.
              </p>
            </div>
            <a
              href="/fan-zone"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-md transition-colors"
            >
              <span>Preview FanZone 📱</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Header Settings */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-900">Header Branding</h4>
              
              <Input
                label="FanZone Title"
                placeholder="FAN ZONE"
                value={fanZoneSettings.headerTitle}
                onChange={(e) => setFanZoneSettings({ ...fanZoneSettings, headerTitle: e.target.value })}
              />

              <Input
                label="FanZone Subtitle"
                placeholder="Fan experiences go live throughout the match"
                value={fanZoneSettings.headerSubtitle}
                onChange={(e) => setFanZoneSettings({ ...fanZoneSettings, headerSubtitle: e.target.value })}
              />

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">Header Custom Logo (Optional)</label>
                <div className="flex items-center gap-3">
                  {fanZoneSettings.headerLogo ? (
                    <img
                      src={fanZoneSettings.headerLogo}
                      alt="Header Logo"
                      className="w-16 h-16 rounded-xl object-contain bg-slate-900 p-1 border border-slate-700"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs font-semibold">
                      No Logo
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-xs">
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Upload Logo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleHeaderLogoFileUpload} />
                    </label>
                    {fanZoneSettings.headerLogo && (
                      <button
                        type="button"
                        onClick={() => setFanZoneSettings({ ...fanZoneSettings, headerLogo: '' })}
                        className="block text-xs text-rose-600 hover:underline"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Powered By Sponsor Settings */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-900">Sponsor & "Powered By" Logo</h4>

              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">"Powered By" Sponsor Logo Image</label>
                <div className="flex items-center gap-3">
                  {fanZoneSettings.poweredByLogo ? (
                    <img
                      src={fanZoneSettings.poweredByLogo}
                      alt="Powered By Logo"
                      className="w-24 h-16 rounded-xl object-contain bg-white p-2 border border-slate-300 shadow-xs"
                    />
                  ) : (
                    <div className="w-24 h-16 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-xs font-semibold">
                      <Image className="w-4 h-4 mb-0.5 text-slate-400" />
                      <span>Add Logo</span>
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-xs">
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Upload Sponsor Logo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePoweredByFileUpload} />
                    </label>
                    {fanZoneSettings.poweredByLogo && (
                      <button
                        type="button"
                        onClick={() => setFanZoneSettings({ ...fanZoneSettings, poweredByLogo: '' })}
                        className="block text-xs text-rose-600 hover:underline"
                      >
                        Remove Logo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <Input
                label="Sponsor Name / Powered By Text"
                placeholder="e.g. Coca-Cola 5G Ultra Stadium Network"
                value={fanZoneSettings.poweredByText}
                onChange={(e) => setFanZoneSettings({ ...fanZoneSettings, poweredByText: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-indigo-100">
            <Button onClick={handleSaveFanZoneSettings} icon={CheckCircle2}>
              Save FanZone Branding
            </Button>
          </div>
        </div>
      </Card>

      {/* Create Brand Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Custom Brand Kit"
        subtitle="Register a new brand identity for automated template transformation"
      >
        <form onSubmit={handleCreateBrand} className="space-y-4">
          <Input
            label="Brand Name"
            placeholder="e.g. Redline Racing"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Brand Logo
            </label>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/80">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 p-1.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo preview" className="max-h-full object-contain" />
                  ) : (
                    <Image className="w-6 h-6 text-slate-500" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <span className="text-xs font-semibold text-slate-900 block">Upload Logo Image File</span>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-400 shadow-xs transition-all">
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoFileUpload}
                      />
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">PNG, SVG, JPG (max 5MB)</span>
                  </div>
                </div>
              </div>

              <Input
                label="Or Image URL"
                placeholder="https://upload.wikimedia.org/..."
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Primary Color</label>
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                className="w-full h-10 rounded-xl cursor-pointer bg-white border border-slate-300 p-1"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Secondary Color</label>
              <input
                type="color"
                value={formData.secondaryColor}
                onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                className="w-full h-10 rounded-xl cursor-pointer bg-white border border-slate-300 p-1"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Accent Color</label>
              <input
                type="color"
                value={formData.accentColor}
                onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                className="w-full h-10 rounded-xl cursor-pointer bg-white border border-slate-300 p-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Collectible Item Name"
              placeholder="e.g. Racing Helmet"
              value={formData.collectibleName}
              onChange={(e) => setFormData({ ...formData, collectibleName: e.target.value })}
            />

            <Input
              label="Collectible Emoji / Icon"
              placeholder="🏎️"
              value={formData.collectibleIcon}
              onChange={(e) => setFormData({ ...formData, collectibleIcon: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Brand Kit</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!brandToDelete}
        onClose={() => setBrandToDelete(null)}
        title="Delete Brand Kit"
        subtitle="Confirm brand kit removal"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <strong className="text-slate-900">{brandToDelete?.name}</strong>? This action cannot be undone and will remove this brand kit preset from the system.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setBrandToDelete(null)} isDisabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" icon={Trash2} onClick={handleDeleteBrand} isLoading={isDeleting}>
              Delete Brand Kit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
