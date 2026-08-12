import React, { useState, useEffect } from 'react';
import {
  Gift,
  Wifi,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Plus,
  ArrowRight,
  Sparkles,
  Ticket,
  Users,
  ShieldCheck,
  Send,
  Tag,
  Hash,
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Dropdown from '../components/ui/Dropdown';
import { DEFAULT_BRAND_KITS } from '../data/brandEngineData';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

const INITIAL_REWARDS = [
  {
    id: 'dialog-air-fibre-10',
    brandName: 'Dialog',
    brandLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    primaryColor: '#ef4444',
    rewardTitle: '10 Air Fibre Packages',
    itemCount: 10,
    claimedCount: 0,
    pendingCount: 10,
    eventName: '5G Experience Zone Event',
    eventDate: 'August 5, 2026',
    status: 'Pending',
    iconType: 'wifi',
    description: 'High-speed Dialog 5G Air Fibre router packages awarded to top interactive event participants.',
    voucherCodes: [
      { code: 'AF-DLG-5G-001', winner: 'Pending Fan Claim', status: 'Pending Approval' },
      { code: 'AF-DLG-5G-002', winner: 'Pending Fan Claim', status: 'Pending Approval' },
      { code: 'AF-DLG-5G-003', winner: 'Pending Fan Claim', status: 'Pending Approval' },
      { code: 'AF-DLG-5G-004', winner: 'Pending Fan Claim', status: 'Pending Approval' },
      { code: 'AF-DLG-5G-005', winner: 'Pending Fan Claim', status: 'Pending Approval' },
      { code: 'AF-DLG-5G-006', winner: 'Pending Fan Claim', status: 'Pending Approval' },
      { code: 'AF-DLG-5G-007', winner: 'Pending Fan Claim', status: 'Pending Approval' },
      { code: 'AF-DLG-5G-008', winner: 'Pending Fan Claim', status: 'Pending Approval' },
      { code: 'AF-DLG-5G-009', winner: 'Pending Fan Claim', status: 'Pending Approval' },
      { code: 'AF-DLG-5G-010', winner: 'Pending Fan Claim', status: 'Pending Approval' },
    ],
  },
  {
    id: 'coca-cola-bottles-5',
    brandName: 'Coca-Cola',
    brandLogo: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=150&auto=format&fit=crop&q=80',
    primaryColor: '#dc2626',
    rewardTitle: '5 Coca-Cola Bottles',
    itemCount: 5,
    claimedCount: 0,
    pendingCount: 5,
    eventName: 'Summer Fan Zone Live',
    eventDate: 'August 5, 2026',
    status: 'Pending',
    iconType: 'gift',
    description: 'Refreshing 500ml Coca-Cola Collector Bottles awarded for fan selfie wall participation.',
    voucherCodes: [
      { code: 'CC-BTL-500-001', winner: 'Pending Fan Claim', status: 'Pending Approval' },
      { code: 'CC-BTL-500-002', winner: 'Pending Fan Claim', status: 'Pending Approval' },
      { code: 'CC-BTL-500-003', winner: 'Pending Fan Claim', status: 'Pending Approval' },
      { code: 'CC-BTL-500-004', winner: 'Pending Fan Claim', status: 'Pending Approval' },
      { code: 'CC-BTL-500-005', winner: 'Pending Fan Claim', status: 'Pending Approval' },
    ],
  },
];

export default function Rewards() {
  const { events } = useApp() || {};
  const toast = useToast();

  const [selectedReward, setSelectedReward] = useState(null);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Active Reward Data in State (with localStorage persistence)
  const [rewardsList, setRewardsList] = useState(() => {
    const saved = localStorage.getItem('fanforge_rewards_list');
    return saved ? JSON.parse(saved) : INITIAL_REWARDS;
  });

  useEffect(() => {
    localStorage.setItem('fanforge_rewards_list', JSON.stringify(rewardsList));
  }, [rewardsList]);

  // Form State for Adding New Reward
  const [newReward, setNewReward] = useState({
    brandName: 'Dialog',
    rewardTitle: '',
    description: '',
    eventName: '5G Experience Zone Event',
    eventDate: new Date().toISOString().split('T')[0],
    itemCount: 10,
    category: 'Gift / Physical Perk',
    codePrefix: '',
  });

  const handleCardClick = (reward) => {
    setSelectedReward(reward);
    setShowPendingModal(true);
  };

  const handleCreateReward = (e) => {
    e.preventDefault();
    if (!newReward.rewardTitle.trim()) {
      toast.error('Please enter a reward title');
      return;
    }

    const count = Math.max(1, parseInt(newReward.itemCount, 10) || 1);
    const prefix = newReward.codePrefix.trim()
      ? newReward.codePrefix.trim().toUpperCase()
      : (newReward.brandName || 'RW').substring(0, 3).toUpperCase() + '-PRK-';

    const generatedVouchers = Array.from({ length: count }, (_, idx) => ({
      code: `${prefix}${String(idx + 1).padStart(3, '0')}`,
      winner: 'Pending Fan Claim',
      status: 'Pending Approval',
    }));

    const categoryName = newReward.category || 'Gift / Physical Perk';
    const isWifiIcon =
      categoryName.toLowerCase().includes('wifi') ||
      categoryName.toLowerCase().includes('fibre') ||
      categoryName.toLowerCase().includes('connectivity');

    const createdItem = {
      id: `reward-${Date.now()}`,
      brandName: newReward.brandName || 'Sponsor',
      primaryColor: '#ef4444',
      rewardTitle: newReward.rewardTitle,
      itemCount: count,
      claimedCount: 0,
      pendingCount: count,
      eventName: newReward.eventName || 'General Event',
      eventDate: newReward.eventDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'Pending',
      category: categoryName,
      iconType: isWifiIcon ? 'wifi' : 'gift',
      description: newReward.description || 'Promotional perk package awarded to event participants.',
      voucherCodes: generatedVouchers,
    };

    setRewardsList([createdItem, ...rewardsList]);
    if (toast && toast.success) {
      toast.success(`Added ${newReward.rewardTitle} (${count} items)!`);
    }
    setIsAddModalOpen(false);
    setNewReward({
      brandName: 'Dialog',
      rewardTitle: '',
      description: '',
      eventName: '5G Experience Zone Event',
      eventDate: new Date().toISOString().split('T')[0],
      itemCount: 10,
      category: 'Gift / Physical Perk',
      codePrefix: '',
    });
  };

  const handleApproveDistribution = (rewardId) => {
    setRewardsList((prevList) =>
      prevList.map((item) => {
        if (item.id === rewardId) {
          return {
            ...item,
            status: 'Approved',
            voucherCodes: item.voucherCodes.map((v) => ({ ...v, status: 'Approved' })),
          };
        }
        return item;
      })
    );
    if (toast && toast.success) {
      toast.success('Approved pending distribution!');
    }
    setShowPendingModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-red-300 text-xs font-semibold border border-white/10">
                <Gift className="w-3.5 h-3.5" />
                <span>Sponsor Rewards & Perks Engine</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Event Sponsor Rewards
            </h1>
            <p className="text-indigo-200/80 text-sm leading-relaxed">
              Manage promotional perks, 5G Air Fibre packages, and sponsor prize distributions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setIsAddModalOpen(true)}
              className="bg-red-600 hover:bg-red-500 text-white font-extrabold shadow-lg shadow-red-900/40 border-none px-5 py-3 rounded-2xl flex items-center gap-2 text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Add Reward
            </Button>
          </div>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Active Sponsor Perks ({rewardsList.length})
          </h2>
          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs border-dashed border-slate-300 hover:border-red-500 text-slate-700 hover:text-red-600 font-bold px-3 py-1.5 rounded-xl"
          >
            Add Reward Perk
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewardsList.map((reward) => (
            <div
              key={reward.id}
              onClick={() => handleCardClick(reward)}
              className="bg-white rounded-3xl border-2 border-slate-200 hover:border-red-500 p-6 shadow-xs hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Brand Badge Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 font-extrabold text-xs">
                      {reward.iconType === 'gift' ? <Gift className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sponsor Brand</span>
                      <h4 className="text-sm font-black text-slate-900">{reward.brandName}</h4>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-mono font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                      reward.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {reward.status === 'Approved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    {reward.status}
                  </span>
                </div>

                {/* Reward Package Title & Item Count */}
                <div className="space-y-1 pt-2">
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-red-600 transition-colors">
                    {reward.rewardTitle}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{reward.description}</p>
                </div>

                {/* Event Name */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span className="font-semibold text-slate-700">{reward.eventName}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">{reward.eventDate}</span>
                </div>
              </div>

              {/* Card Footer Call to Action */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Click to view items</span>
                <span className="font-bold text-red-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  View Items <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ADD REWARD POPUP MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Sponsor Reward"
        subtitle="Create a promotional perk package for event activations"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateReward} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Sponsor Brand</label>
              <Dropdown
                options={[
                  { value: 'Dialog', label: 'Dialog' },
                  { value: 'Coca-Cola', label: 'Coca-Cola' },
                  { value: 'Pepsi', label: 'Pepsi' },
                  { value: 'Red Bull', label: 'Red Bull' },
                  { value: 'Sprite', label: 'Sprite' },
                  { value: 'Samsung', label: 'Samsung' },
                ]}
                value={newReward.brandName}
                onChange={(val) => setNewReward({ ...newReward, brandName: val })}
              />
            </div>

            <Input
              label="Reward Title"
              placeholder="e.g. 15 VIP Fan Vouchers"
              value={newReward.rewardTitle}
              onChange={(e) => setNewReward({ ...newReward, rewardTitle: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              rows={2}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-150"
              placeholder="Detailed description of the reward package and claim instructions..."
              value={newReward.description}
              onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Event</label>
              {events && events.length > 0 ? (
                <Dropdown
                  options={events.map((evt) => ({ value: evt.name, label: evt.name }))}
                  value={newReward.eventName}
                  onChange={(val) => setNewReward({ ...newReward, eventName: val })}
                />
              ) : (
                <Input
                  placeholder="e.g. 5G Experience Zone Event"
                  value={newReward.eventName}
                  onChange={(e) => setNewReward({ ...newReward, eventName: e.target.value })}
                />
              )}
            </div>

            <Input
              label="Event Date"
              type="date"
              value={newReward.eventDate}
              onChange={(e) => setNewReward({ ...newReward, eventDate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Item Quantity"
              type="number"
              min="1"
              max="1000"
              value={newReward.itemCount}
              onChange={(e) => setNewReward({ ...newReward, itemCount: e.target.value })}
              required
            />

            <Input
              label="Perk Category"
              placeholder="e.g. Gift / Physical Perk"
              value={newReward.category}
              onChange={(e) => setNewReward({ ...newReward, category: e.target.value })}
            />

            <Input
              label="Voucher Code Prefix"
              placeholder="e.g. DLG-5G-"
              helperText="Auto-generates codes"
              value={newReward.codePrefix}
              onChange={(e) => setNewReward({ ...newReward, codePrefix: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Plus}
              className="bg-red-600 hover:bg-red-700 text-white border-none font-bold px-4 py-2"
            >
              Add Reward Package
            </Button>
          </div>
        </form>
      </Modal>

      {/* PENDING REWARDS POPUP MODAL */}
      {showPendingModal && selectedReward && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setShowPendingModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      selectedReward.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    ● {selectedReward.status} Status
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{selectedReward.brandName}</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Reward Vouchers</h2>
                <p className="text-xs text-slate-500">Distribution and claim queue for {selectedReward.eventName}</p>
              </div>
            </div>

            {/* Reward Summary Details */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sponsor Brand</span>
                <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">{selectedReward.brandName}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reward Offer</span>
                <span className="font-extrabold text-red-600 text-sm mt-0.5 block">{selectedReward.rewardTitle}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Event</span>
                <span className="font-extrabold text-slate-900 text-sm mt-0.5 block truncate">{selectedReward.eventName}</span>
              </div>
            </div>

            {/* Voucher Items List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <h3 className="font-bold text-slate-800 uppercase tracking-wider">
                  Voucher Items ({selectedReward.voucherCodes.length})
                </h3>
                <span className="text-amber-600 font-mono font-bold text-[11px]">
                  0 / {selectedReward.voucherCodes.length} Distributed
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedReward.voucherCodes.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs hover:border-amber-400 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-mono font-bold text-xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <span className="font-mono font-bold text-slate-900 block">{item.code}</span>
                        <span className="text-[10px] text-slate-400">{item.winner}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border ${
                        item.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPendingModal(false)}
                className="text-xs"
              >
                Close
              </Button>
              {selectedReward.status !== 'Approved' && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={CheckCircle2}
                  onClick={() => handleApproveDistribution(selectedReward.id)}
                  className="text-xs bg-red-600 hover:bg-red-700 text-white border-none"
                >
                  Approve Pending Distribution
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

