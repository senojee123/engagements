import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  Globe,
  Mail,
  Users,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  LayoutGrid,
  List as ListIcon,
  Upload,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import EmptyState from '../components/ui/EmptyState';
import FilterPills from '../components/ui/FilterPills';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

export default function Organizations() {
  const { organizations, createOrganization, updateOrganization, deleteOrganization } = useApp();
  const toast = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);

  // Confirm Delete State
  const [deletingOrgId, setDeletingOrgId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    industry: 'Sports',
    description: '',
    website: '',
    contactEmail: '',
    logo: '',
  });

  const industries = ['All', 'Sports', 'Entertainment', 'Corporate', 'Retail', 'Education'];

  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.industry.toLowerCase().includes(search.toLowerCase()) ||
      org.contactEmail.toLowerCase().includes(search.toLowerCase());

    const matchesIndustry = industryFilter === 'All' || org.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  const handleOpenCreateModal = () => {
    setEditingOrg(null);
    setFormData({
      name: '',
      industry: 'Sports',
      description: '',
      website: '',
      contactEmail: '',
      logo: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=150&q=80',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (org) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      industry: org.industry,
      description: org.description,
      website: org.website,
      contactEmail: org.contactEmail,
      logo: org.logo,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      if (editingOrg) {
        await updateOrganization(editingOrg.id, formData);
        toast.success(`Updated "${formData.name}" successfully.`);
      } else {
        await createOrganization(formData);
        toast.success(`Organization "${formData.name}" created!`);
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Unable to save organization.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingOrgId) {
      try {
        await deleteOrganization(deletingOrgId);
        toast.success('Organization deleted successfully.');
      } catch (err) {
        toast.error(err.message || 'Unable to delete organization.');
      } finally {
        setDeletingOrgId(null);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Organization Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your brands, venue operators, and enterprise partner accounts.
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} icon={Plus}>
          Add Organization
        </Button>
      </div>

      {/* Toolbar: Search, Filters, View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, industry, or email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Industry Filter Pills */}
        <FilterPills options={industries} value={industryFilter} onChange={setIndustryFilter} />

        {/* View Toggle */}
        <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-1 bg-slate-50 shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
            aria-pressed={viewMode === 'grid'}
            className={`p-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              viewMode === 'grid' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            aria-label="List view"
            aria-pressed={viewMode === 'list'}
            className={`p-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              viewMode === 'list' ? 'bg-white shadow-xs text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid or List Content */}
      {filteredOrgs.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrgs.map((org) => (
              <Card key={org.id} hoverEffect className="flex flex-col justify-between">
                <CardContent className="p-6">
                  {/* Top Info */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={org.logo}
                        alt={org.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs"
                      />
                      <div>
                        <h3
                          onClick={() => navigate(`/organizations/${org.id}`)}
                          className="font-bold text-slate-900 text-base hover:text-indigo-600 cursor-pointer transition-colors line-clamp-1"
                        >
                          {org.name}
                        </h3>
                        <Badge variant="indigo" size="sm" className="mt-1">
                          {org.industry}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(org)}
                        aria-label={`Edit ${org.name}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        title="Edit Organization"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingOrgId(org.id)}
                        aria-label={`Delete ${org.name}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                        title="Delete Organization"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {org.description || 'No description provided for this organization.'}
                  </p>

                  <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-400" /> Website
                      </span>
                      <a
                        href={org.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        {org.website.replace('https://', '')} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> Contact
                      </span>
                      <span className="text-slate-700">{org.contactEmail}</span>
                    </div>
                  </div>
                </CardContent>

                {/* Card Footer */}
                <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 rounded-b-2xl flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" /> {org.memberCount} Team Members
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> {org.eventCount} Events
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100">
              {filteredOrgs.map((org) => (
                <div key={org.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <img
                      src={org.logo}
                      alt={org.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <h3
                        onClick={() => navigate(`/organizations/${org.id}`)}
                        className="font-bold text-slate-900 text-sm hover:text-indigo-600 cursor-pointer"
                      >
                        {org.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {org.industry} • {org.contactEmail}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="hidden sm:flex items-center gap-4 text-xs text-slate-500">
                      <span>{org.memberCount} members</span>
                      <span>{org.eventCount} events</span>
                    </div>
                    <Badge variant="emerald" size="sm">
                      {org.status}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(org)}
                        aria-label={`Edit ${org.name}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingOrgId(org.id)}
                        aria-label={`Delete ${org.name}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        <EmptyState
          icon={Building2}
          title="No organizations found"
          description="Try adjusting your search terms or create a new organization."
          actionLabel="Create Organization"
          onAction={handleOpenCreateModal}
        />
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOrg ? 'Edit Organization' : 'Create New Organization'}
        subtitle={editingOrg ? 'Update organization profile and contact info' : 'Register a new enterprise partner'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Organization Name"
            placeholder="e.g. Apex Sports Global"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Industry"
              placeholder="Sports, Retail, etc."
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            />
            <Input
              label="Website URL"
              placeholder="https://apexsports.com"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
          </div>

          <Input
            label="Contact Email"
            type="email"
            placeholder="contact@apexsports.com"
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            required
          />

          <Input
            label="Logo Image URL"
            placeholder="https://images.unsplash.com/photo-..."
            value={formData.logo}
            onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
            helperText="Enter a valid image URL for logo preview."
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the organization and target event types..."
              className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:outline-none transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingOrg ? 'Save Changes' : 'Create Organization'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingOrgId}
        onClose={() => setDeletingOrgId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Organization"
        description="Are you sure you want to delete this organization? All associated events and data will be permanently unlinked."
        confirmText="Delete Organization"
      />
    </div>
  );
}
