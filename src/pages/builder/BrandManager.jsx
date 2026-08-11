import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Plus, Edit2, Sparkles, CheckCircle2, Trash2, Upload, Image, Eye, Layers, Calendar, ExternalLink, Copy, Check } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { fetchBrandKits, createBrandKitApi, deleteBrandKitApi, fetchInstancesApi, fetchEvents } from '../../lib/api';
import { DEFAULT_BRAND_KITS } from '../../data/brandEngineData';
import { useToast } from '../../context/ToastContext';

export default function BrandManager() {
  const navigate = useNavigate();
  const toast = useToast();
  const [brands, setBrands] = useState(DEFAULT_BRAND_KITS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchBrandKits()
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setBrands(data);
        } else if (!cancelled) {
          setBrands(DEFAULT_BRAND_KITS);
        }
      })
      .catch(() => {
        if (!cancelled) setBrands(DEFAULT_BRAND_KITS);
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

  // Brand Overview Modal State
  const [selectedBrandOverview, setSelectedBrandOverview] = useState(null);
  const [brandInstances, setBrandInstances] = useState([]);
  const [brandEvents, setBrandEvents] = useState([]);
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const handleOpenBrandOverview = async (brand) => {
    setSelectedBrandOverview(brand);
    setIsLoadingOverview(true);
    try {
      const [instancesData, eventsData] = await Promise.all([
        fetchInstancesApi(),
        fetchEvents(),
      ]);
      const matchedInstances = Array.isArray(instancesData)
        ? instancesData.filter(
            (i) => i.brandId === brand.id || (i.brandId && i.brandId.toLowerCase().includes(brand.name.toLowerCase()))
          )
        : [];
      const matchedEvents = Array.isArray(eventsData)
        ? eventsData.filter(
            (e) => e.organization_id === brand.id || e.name.toLowerCase().includes(brand.name.toLowerCase())
          )
        : eventsData || [];
      setBrandInstances(matchedInstances);
      setBrandEvents(matchedEvents);
    } catch (err) {
      console.warn('Failed to load brand overview data:', err);
    } finally {
      setIsLoadingOverview(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
                <div className="w-14 h-14 rounded-2xl bg-slate-50 p-2 flex items-center justify-center border border-slate-200/80 shadow-xs">
                  <img src={brand.logo} alt={brand.name} className="max-h-full max-w-full object-contain" />
                </div>
                <Badge variant="indigo" size="sm">
                  Preset
                </Badge>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">{brand.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5 italic">{brand.tagline}</p>
              </div>

            </CardContent>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                icon={Eye}
                onClick={() => handleOpenBrandOverview(brand)}
                className="bg-white border-slate-200 text-indigo-600 font-bold hover:bg-indigo-50"
              >
                Overview & Usage
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
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo preview" className="max-h-full max-w-full object-contain" />
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

      {/* Brand Overview & Engagement Usage Modal */}
      <Modal
        isOpen={!!selectedBrandOverview}
        onClose={() => setSelectedBrandOverview(null)}
        title={`${selectedBrandOverview?.name || 'Brand'} — Overview & Engagements Usage`}
        subtitle="Detailed audit of customized engagements, active events, and brand kit tokens"
      >
        {selectedBrandOverview && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white p-2 flex items-center justify-center border border-white/20 shadow-md shrink-0">
                  <img
                    src={selectedBrandOverview.logo}
                    alt={selectedBrandOverview.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">{selectedBrandOverview.name}</h3>
                  <p className="text-xs text-indigo-200/80 mt-0.5">{selectedBrandOverview.tagline || 'Custom Activation Brand'}</p>
                </div>
              </div>
            </div>

            {/* Engagements Used Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" /> Engagements Used ({brandInstances.length})
              </h4>

              {isLoadingOverview ? (
                <div className="p-6 text-center text-xs text-slate-500 font-medium">
                  Loading brand engagement instances...
                </div>
              ) : brandInstances.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {brandInstances.map((inst) => {
                    const fanUrl = `${window.location.origin}/e/${inst.appId}/${inst.instanceId}`;
                    const displayUrl = `${window.location.origin}/e/${inst.appId}/${inst.instanceId}/display`;

                    return (
                      <div
                        key={inst.instanceId}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-indigo-700 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                              {inst.appId}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[9px] uppercase border border-emerald-300">
                              {inst.status || 'Published'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono">
                            UUID: {inst.instanceId}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={fanUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[11px] flex items-center gap-1 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3 text-indigo-600" /> Fan View
                          </a>
                          <a
                            href={displayUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3 text-cyan-400" /> Display
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  No published engagement instances found for this brand yet. Customize a template in the library to mint an instance.
                </div>
              )}
            </div>

            {/* Events Used For Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" /> Events Attached ({brandEvents.length})
              </h4>

              {brandEvents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {brandEvents.map((evt) => (
                    <div key={evt.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                      <h5 className="font-bold text-slate-900">{evt.name}</h5>
                      <p className="text-slate-500 text-[11px]">Venue: {evt.venue || 'Stadium Activation'}</p>
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {evt.status || 'Active Event'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  No active events assigned to this brand.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedBrandOverview(null)}>
                Close Overview
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
