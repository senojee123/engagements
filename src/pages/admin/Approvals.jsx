import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  SlidersHorizontal,
  Eye,
  ExternalLink,
  Shield,
  Sparkles,
  Gamepad2,
  Tv,
  Check,
  X,
  Copy,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { fetchInstancesApi, approveInstanceApi, rejectInstanceApi } from '../../lib/api';

export default function Approvals() {
  const toast = useToast();
  const [instances, setInstances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const loadInstances = async () => {
    setIsLoading(true);
    try {
      const data = await fetchInstancesApi();
      setInstances(data || []);
    } catch (err) {
      toast.error('Failed to load pending approvals.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInstances();
  }, []);

  const handleApprove = async (instId) => {
    try {
      await approveInstanceApi(instId);
      toast.success(`Engagement customization ${instId.slice(0, 10)}... Approved!`);
      loadInstances();
      if (selectedInstance?.instanceId === instId) {
        setSelectedInstance(null);
      }
    } catch (err) {
      toast.error(err.message || 'Unable to approve customization.');
    }
  };

  const handleReject = async (instId) => {
    try {
      await rejectInstanceApi(instId);
      toast.info(`Engagement customization ${instId.slice(0, 10)}... Rejected.`);
      loadInstances();
      if (selectedInstance?.instanceId === instId) {
        setSelectedInstance(null);
      }
    } catch (err) {
      toast.error(err.message || 'Unable to reject customization.');
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('UUID copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredInstances = instances.filter((inst) => {
    const matchesSearch =
      (inst.brandName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inst.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inst.instanceId || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatusFilter === 'all' || (inst.status || 'pending').toLowerCase() === selectedStatusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch ((status || 'pending').toLowerCase()) {
      case 'approved':
        return <Badge variant="emerald">Approved</Badge>;
      case 'launched':
        return <Badge variant="indigo">Launched & Live</Badge>;
      case 'rejected':
        return <Badge variant="rose">Rejected</Badge>;
      default:
        return <Badge variant="amber">Pending Admin Approval</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-indigo-500/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
            <Shield className="w-3.5 h-3.5" /> Super Admin Governance Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Brand Customization Approvals</h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            Review, inspect, approve, or reject customized Brand engagement instances before they can go live to stadium displays and fan portals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={loadInstances} isLoading={isLoading}>
            Refresh List
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Brand Name, Title, or UUID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['all', 'pending', 'approved', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                selectedStatusFilter === st
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Instance Approvals Table / Grid */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-500">Loading customization requests...</p>
        </div>
      ) : filteredInstances.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80">
          <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Customization Submissions Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            When Brands customize an engagement and press "Save & Send for Approval", their generated UUID payloads will appear here for review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredInstances.map((inst) => (
            <Card key={inst.instanceId} className="hover:border-slate-300 transition-all">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(inst.status)}
                    <span className="text-[11px] font-mono font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      {inst.instanceId}
                      <button
                        onClick={() => copyToClipboard(inst.instanceId, inst.instanceId)}
                        className="hover:text-slate-700"
                      >
                        {copiedId === inst.instanceId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      • Submitted {new Date((inst.publishedAt || inst.createdAt || 0) * 1000).toLocaleString()}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900">
                    {inst.title || inst.appId || 'Custom Engagement'}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                    <span className="font-bold text-indigo-700">{inst.brandName || 'Brand Account'}</span>
                    <span>•</span>
                    <span className="capitalize">{inst.templateId || inst.appId}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => setSelectedInstance(inst)}
                  >
                    Inspect Config
                  </Button>

                  {(inst.status || 'pending').toLowerCase() === 'pending' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={CheckCircle2}
                        onClick={() => handleApprove(inst.instanceId)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        Approve
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={XCircle}
                        onClick={() => handleReject(inst.instanceId)}
                        className="text-rose-600 hover:bg-rose-50 border-rose-200"
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {(inst.status || '').toLowerCase() === 'approved' && (
                    <Badge variant="emerald" size="md">
                      ✅ Approved for Brand Launch
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Inspect Customization Modal */}
      {selectedInstance && (
        <Modal
          isOpen={!!selectedInstance}
          onClose={() => setSelectedInstance(null)}
          title={`Inspect Payload: ${selectedInstance.instanceId}`}
          size="lg"
        >
          <div className="space-y-5">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Brand / Company</span>
                <span className="text-sm font-extrabold text-slate-900">{selectedInstance.brandName || 'Brand Account'}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Current Status</span>
                {getStatusBadge(selectedInstance.status)}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Custom JSON Config Payload
              </h4>
              <pre className="p-4 bg-slate-950 text-slate-200 text-xs font-mono rounded-2xl overflow-x-auto max-h-80">
                {JSON.stringify(selectedInstance.config, null, 2)}
              </pre>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setSelectedInstance(null)}>
                Close
              </Button>
              {(selectedInstance.status || 'pending').toLowerCase() === 'pending' && (
                <>
                  <Button
                    variant="secondary"
                    icon={XCircle}
                    onClick={() => handleReject(selectedInstance.instanceId)}
                    className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    icon={CheckCircle2}
                    onClick={() => handleApprove(selectedInstance.instanceId)}
                    className="bg-emerald-600 hover:bg-emerald-500"
                  >
                    Approve Customization
                  </Button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
