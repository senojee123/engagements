import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Star,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Filter,
  CheckSquare,
  Square,
  Eye,
  RefreshCcw,
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Tabs from '../ui/Tabs';
import { useSelfieWall } from '../../context/SelfieWallContext';
import { useToast } from '../../context/ToastContext';

export default function SelfieModerationPanel() {
  const {
    selfies,
    approvedSelfies,
    pendingSelfies,
    flaggedSelfies,
    rejectedSelfies,
    featuredSelfies,
    approveSelfie,
    rejectSelfie,
    toggleFeatured,
    deleteSelfie,
    bulkApprove,
    bulkReject,
    aiAutoApprove,
    setAiAutoApprove,
    aiSensitivity,
    setAiSensitivity,
    resetAllSelfies,
  } = useSelfieWall();

  const toast = useToast();
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedIds, setSelectedIds] = useState([]);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  // Tab Dataset mapping
  const getTabSelfies = () => {
    switch (activeTab) {
      case 'pending':
        return pendingSelfies;
      case 'approved':
        return approvedSelfies;
      case 'flagged':
        return flaggedSelfies;
      case 'rejected':
        return rejectedSelfies;
      case 'featured':
        return featuredSelfies;
      default:
        return selfies;
    }
  };

  const currentTabSelfies = getTabSelfies();

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === currentTabSelfies.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentTabSelfies.map((s) => s.id));
    }
  };

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;
    bulkApprove(selectedIds);
    toast.success(`Approved ${selectedIds.length} selfies to Big Screen!`);
    setSelectedIds([]);
  };

  const handleBulkReject = () => {
    if (selectedIds.length === 0) return;
    bulkReject(selectedIds);
    toast.info(`Rejected ${selectedIds.length} selfies`);
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Top AI Engine & Auto-Moderation Control Bar */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold mb-1">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI IMAGE ANALYSIS & MODERATION ENGINE</span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Selfie Wall Live Moderation Queue
          </h2>
          <p className="text-xs text-indigo-200/80 mt-0.5">
            Real-time WebSocket stream inspecting incoming fan uploads before stadium broadcast.
          </p>
        </div>

        {/* AI Auto-Approve Switcher */}
        <div className="flex flex-wrap items-center gap-4 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-white flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={aiAutoApprove}
                onChange={(e) => setAiAutoApprove(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
              />
              <span>AI Auto-Approve Low Risk Photos</span>
            </label>
          </div>

          <div className="h-6 w-px bg-white/20 hidden sm:block" />

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-300 font-medium">Safety Threshold:</span>
            <span className="font-mono font-bold text-cyan-300">{aiSensitivity}%</span>
          </div>

          <button
            onClick={() => {
              resetAllSelfies();
              toast.info('Reset moderation dataset');
            }}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
            title="Reset Moderation Queue"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs & Bulk Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs
          tabs={[
            { id: 'pending', label: `Pending Queue (${pendingSelfies.length})` },
            { id: 'flagged', label: `AI Flagged (${flaggedSelfies.length})` },
            { id: 'approved', label: `Approved (${approvedSelfies.length})` },
            { id: 'featured', label: `Featured ⭐ (${featuredSelfies.length})` },
            { id: 'rejected', label: `Rejected (${rejectedSelfies.length})` },
          ]}
          activeTab={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            setSelectedIds([]);
          }}
        />

        {/* Bulk Actions */}
        <div className="flex items-center gap-2">
          {currentTabSelfies.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={selectedIds.length === currentTabSelfies.length ? CheckSquare : Square}
              onClick={handleSelectAll}
            >
              {selectedIds.length === currentTabSelfies.length ? 'Deselect All' : 'Select All'}
            </Button>
          )}

          {selectedIds.length > 0 && (
            <>
              <Button variant="primary" size="sm" icon={CheckCircle2} onClick={handleBulkApprove}>
                Approve ({selectedIds.length})
              </Button>
              <Button variant="rose" size="sm" icon={XCircle} onClick={handleBulkReject}>
                Reject ({selectedIds.length})
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Moderation Cards Grid */}
      {currentTabSelfies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {currentTabSelfies.map((photo) => {
            const isSelected = selectedIds.includes(photo.id);
            return (
              <Card
                key={photo.id}
                className={`overflow-hidden transition-all flex flex-col justify-between ${
                  isSelected ? 'ring-2 ring-indigo-600 border-indigo-500 bg-indigo-50/20' : ''
                }`}
              >
                <div className="relative aspect-square bg-slate-900 overflow-hidden">
                  <img
                    src={photo.photoUrl}
                    alt={photo.uploaderName}
                    className="w-full h-full object-cover"
                  />

                  {/* Multi-Select Checkbox Overlay */}
                  <button
                    onClick={() => handleToggleSelect(photo.id)}
                    className={`absolute top-3 left-3 p-1 rounded-lg backdrop-blur-md transition-all ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-black/50 text-white hover:bg-black/80'
                    }`}
                  >
                    {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>

                  {/* AI Safety Score Badge */}
                  <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md backdrop-blur-md text-white ${
                        photo.aiSafetyScore >= 80
                          ? 'bg-emerald-600'
                          : photo.aiSafetyScore >= 50
                          ? 'bg-amber-500'
                          : 'bg-rose-600'
                      }`}
                    >
                      AI Safety: {photo.aiSafetyScore}%
                    </span>
                  </div>

                  {/* Featured Badge */}
                  {photo.isFeatured && (
                    <span className="absolute bottom-3 left-3 bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> Featured
                    </span>
                  )}
                </div>

                <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{photo.uploaderName}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{photo.uploadTime}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{photo.caption}</p>

                    {/* AI Risk Flags */}
                    {photo.aiFlags && photo.aiFlags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {photo.aiFlags.map((flag, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200"
                          >
                            ⚠️ {flag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Single Action Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {photo.status !== 'approved' && (
                        <button
                          onClick={() => {
                            approveSelfie(photo.id);
                            toast.success(`Approved ${photo.uploaderName}'s selfie! Broadcasted to Jumbotron.`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                          title="Approve & Send to Big Screen"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approve
                        </button>
                      )}

                      {photo.status !== 'rejected' && (
                        <button
                          onClick={() => {
                            rejectSelfie(photo.id);
                            toast.info(`Rejected photo from ${photo.uploaderName}`);
                          }}
                          className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                          title="Reject Photo"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => toggleFeatured(photo.id)}
                        className={`p-1.5 rounded-xl transition-colors ${
                          photo.isFeatured ? 'bg-amber-50 text-amber-600' : 'text-slate-400 hover:bg-slate-100'
                        }`}
                        title="Toggle Featured Spotlight"
                      >
                        <Star className={`w-4 h-4 ${photo.isFeatured ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <button
                      onClick={() => deleteSelfie(photo.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No selfies in this moderation queue</h3>
          <p className="text-xs text-slate-500">
            Incoming fan uploads from the mobile web event portal will appear here in real-time.
          </p>
        </div>
      )}
    </div>
  );
}
