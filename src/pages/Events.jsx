import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  MapPin,
  Building2,
  Eye,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Dropdown from '../components/ui/Dropdown';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import FilterPills from '../components/ui/FilterPills';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

export default function Events() {
  const { events, createEvent, updateEvent, deleteEvent, organizations } = useApp();
  const toast = useToast();

  const [activeStatusTab, setActiveStatusTab] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEventId, setDeletingEventId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'Sports',
    venue: '',
    startDate: '',
    endDate: '',
    organizationId: '',
    status: 'Upcoming',
    capacity: 10000,
  });

  const statusTabs = ['All', 'Upcoming', 'Live', 'Completed', 'Draft'];
  const eventTypes = ['Sports', 'Festival', 'Corporate', 'Retail', 'Product Launch', 'University', 'Exhibition'];

  const typeOptions = [
    { value: 'All', label: 'All Event Types' },
    ...eventTypes.map((t) => ({ value: t, label: t })),
  ];

  const statusOptions = [
    { value: 'Upcoming', label: 'Upcoming' },
    { value: 'Live', label: 'Live Now' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Draft', label: 'Draft' },
  ];

  const orgOptions = organizations.map((org) => ({ value: org.id, label: org.name }));

  // Filter events
  const filteredEvents = events.filter((evt) => {
    const matchesStatus = activeStatusTab === 'All' || evt.status === activeStatusTab;
    const matchesType = selectedType === 'All' || evt.type === selectedType;
    return matchesStatus && matchesType;
  });

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormData({
      name: '',
      type: 'Sports',
      venue: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      organizationId: organizations[0]?.id || '',
      status: 'Upcoming',
      capacity: 10000,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (evt) => {
    setEditingEvent(evt);
    setFormData({
      name: evt.name,
      type: evt.type,
      venue: evt.venue,
      startDate: evt.startDate,
      endDate: evt.endDate,
      organizationId: evt.organizationId || '',
      status: evt.status,
      capacity: evt.capacity,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, formData);
        toast.success(`Updated event "${formData.name}".`);
      } else {
        await createEvent(formData);
        toast.success(`Scheduled event "${formData.name}"!`);
      }
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Unable to save event.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingEventId) {
      try {
        await deleteEvent(deletingEventId);
        toast.success('Event removed successfully.');
      } catch (err) {
        toast.error(err.message || 'Unable to delete event.');
      } finally {
        setDeletingEventId(null);
      }
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Live':
        return (
          <Badge variant="emerald" showDot>
            Live Now
          </Badge>
        );
      case 'Upcoming':
        return (
          <Badge variant="indigo" showDot>
            Upcoming
          </Badge>
        );
      case 'Completed':
        return <Badge variant="slate">Completed</Badge>;
      case 'Draft':
        return <Badge variant="amber">Draft</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  // DataTable Columns Definition
  const columns = [
    {
      header: 'Event Details',
      key: 'name',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{row.name}</h4>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span className="font-medium text-indigo-600">{row.type}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" /> {row.venue}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Organizer',
      key: 'organizer',
      sortable: true,
      render: (val) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Building2 className="w-3.5 h-3.5 text-slate-400" /> {val}
        </span>
      ),
    },
    {
      header: 'Date Range',
      key: 'startDate',
      sortable: true,
      render: (val, row) => (
        <div className="text-xs text-slate-600 font-medium">
          <div>{row.startDate}</div>
          <div className="text-slate-400 text-[10px]">to {row.endDate}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (val) => renderStatusBadge(val),
    },
    {
      header: 'Actions',
      key: 'actions',
      sortable: false,
      render: (val, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(row);
            }}
            aria-label={`Edit ${row.name}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            title="Edit Event"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeletingEventId(row.id);
            }}
            aria-label={`Delete ${row.name}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            title="Delete Event"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Event Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Schedule, monitor, and configure interactive engagement experiences across venues.
          </p>
        </div>
        <Button onClick={handleOpenCreate} icon={Plus}>
          Schedule Event
        </Button>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Status Tabs */}
        <FilterPills options={statusTabs} value={activeStatusTab} onChange={setActiveStatusTab} />

        {/* Type Filter Dropdown */}
        <div className="w-full md:w-56">
          <Dropdown
            options={typeOptions}
            value={selectedType}
            onChange={(val) => setSelectedType(val)}
          />
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredEvents}
        searchPlaceholder="Search event name, venue, organizer..."
        emptyTitle="No events scheduled"
        emptyDescription="There are no events matching your selected criteria."
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEvent ? 'Edit Event Details' : 'Schedule New Event'}
        subtitle={editingEvent ? 'Update event timing, location, or status' : 'Fill in event metadata for live engagement'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Event Name"
            placeholder="e.g. Championship Finals 2026"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Dropdown
              label="Event Type"
              options={eventTypes.map((t) => ({ value: t, label: t }))}
              value={formData.type}
              onChange={(val) => setFormData({ ...formData, type: val })}
            />

            <Dropdown
              label="Organizer"
              options={orgOptions}
              value={formData.organizationId}
              onChange={(val) => setFormData({ ...formData, organizationId: val })}
            />
          </div>

          <Input
            label="Venue Location"
            placeholder="e.g. Metropolis Dome Arena"
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Dropdown
              label="Status"
              options={statusOptions}
              value={formData.status}
              onChange={(val) => setFormData({ ...formData, status: val })}
            />

            <Input
              label="Attendee Capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingEvent ? 'Save Event Changes' : 'Schedule Event'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingEventId}
        onClose={() => setDeletingEventId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Event"
        description="Are you sure you want to delete this event? This action will immediately remove it from all scheduled engagement boards."
        confirmText="Delete Event"
      />
    </div>
  );
}
