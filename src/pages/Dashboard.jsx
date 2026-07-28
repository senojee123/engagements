import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Calendar,
  Users,
  Activity,
  Plus,
  UserPlus,
  ArrowUpRight,
  Clock,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatRelativeTime } from '../lib/formatRelativeTime';

export default function Dashboard() {
  const { organizations, events, activities, createOrganization, createEvent } = useApp();
  const { user, currentRole } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Modals for Quick Actions
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Form states
  const [orgForm, setOrgForm] = useState({ name: '', industry: 'Sports', contactEmail: '' });
  const [eventForm, setEventForm] = useState({ name: '', venue: '', startDate: '', type: 'Sports' });
  const [inviteEmail, setInviteEmail] = useState('');

  // Stats calculation
  const activeOrgsCount = organizations.filter((o) => o.status === 'Active').length;
  const upcomingEventsCount = events.filter((e) => e.status === 'Upcoming' || e.status === 'Live').length;
  const totalRegisteredUsers = events.reduce((sum, e) => sum + (e.registeredAttendees || 0), 0);
  const industryCount = new Set(organizations.map((o) => o.industry)).size;
  const liveEventsCount = events.filter((e) => e.status === 'Live').length;

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    if (!orgForm.name) return;
    try {
      await createOrganization(orgForm);
      toast.success(`Organization "${orgForm.name}" created!`);
      setOrgForm({ name: '', industry: 'Sports', contactEmail: '' });
      setIsOrgModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Unable to create organization.');
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!eventForm.name) return;
    try {
      await createEvent(eventForm);
      toast.success(`Event "${eventForm.name}" scheduled!`);
      setEventForm({ name: '', venue: '', startDate: '', type: 'Sports' });
      setIsEventModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Unable to schedule event.');
    }
  };

  const handleInviteUser = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
    setIsInviteModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-cyan-300 text-xs font-semibold mb-3 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Engagement Operating System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {user?.name || 'Alex'}!
            </h1>
            <p className="text-indigo-200/80 text-sm mt-1 max-w-xl">
              You are logged in as <span className="font-bold text-white">{currentRole}</span>. 
              Manage organizations, events, and live fan activations across your network.
            </p>
          </div>

          {/* Quick Action Bar Header */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              onClick={() => setIsOrgModalOpen(true)}
              variant="secondary"
              size="sm"
              icon={Plus}
            >
              New Org
            </Button>
            <Button
              onClick={() => setIsEventModalOpen(true)}
              variant="primary"
              size="sm"
              icon={Plus}
            >
              New Event
            </Button>
            <Button
              onClick={() => setIsInviteModalOpen(true)}
              variant="outline"
              size="sm"
              icon={UserPlus}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              Invite User
            </Button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Active Orgs */}
        <Card hoverEffect>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Organizations
              </span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {activeOrgsCount}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Across {industryCount} primary industry vertical{industryCount === 1 ? '' : 's'}
            </p>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card hoverEffect>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Upcoming Events
              </span>
              <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {upcomingEventsCount}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3" /> Scheduled
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {liveEventsCount} live stream{liveEventsCount === 1 ? '' : 's'} ongoing right now
            </p>
          </CardContent>
        </Card>

        {/* Registered Users */}
        <Card hoverEffect>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Registered Fans & Users
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {totalRegisteredUsers.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Active stadium attendee profiles</p>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card hoverEffect>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                System Activity Log
              </span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {activities.length}
              </span>
              <Badge variant="indigo" size="sm">
                Real-time
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-2">Actions logged in past 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Activity Timeline & Quick Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Timeline (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Activity Feed</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Live updates across organizations and events</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => toast.info('Activity stream refreshed')}>
                Refresh
              </Button>
            </CardHeader>

            <CardContent className="p-6">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {activities.map((act) => (
                  <div key={act.id} className="relative group">
                    {/* Icon Dot */}
                    <div className="absolute -left-[30px] top-0.5 w-5 h-5 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center">
                      <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                          {act.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">{act.description}</p>
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0 font-medium">{formatRelativeTime(act.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Organizations Preview */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick System Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <button
                onClick={() => setIsOrgModalOpen(true)}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200/90 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Create Organization
                    </p>
                    <p className="text-xs text-slate-500">Register new client or brand</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </button>

              <button
                onClick={() => setIsEventModalOpen(true)}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200/90 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-cyan-600 transition-colors">
                      Create Event
                    </p>
                    <p className="text-xs text-slate-500">Schedule stadium or digital event</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
              </button>

              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200/90 hover:border-purple-500 hover:bg-purple-50/50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
                      Invite Team User
                    </p>
                    <p className="text-xs text-slate-500">Grant permissions to operator</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
              </button>
            </CardContent>
          </Card>

          {/* Featured Organizations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Top Organizations</CardTitle>
              <Button variant="link" size="sm" onClick={() => navigate('/organizations')}>
                View all
              </Button>
            </CardHeader>
            <CardContent className="p-6 divide-y divide-slate-100">
              {organizations.slice(0, 3).map((org) => (
                <div key={org.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={org.logo}
                      alt={org.name}
                      className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{org.name}</h4>
                      <p className="text-xs text-slate-500">{org.industry} • {org.eventCount} events</p>
                    </div>
                  </div>
                  <Badge variant="emerald" size="sm">
                    {org.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Action Modals */}
      {/* Create Org Modal */}
      <Modal
        isOpen={isOrgModalOpen}
        onClose={() => setIsOrgModalOpen(false)}
        title="Create New Organization"
        subtitle="Register an enterprise partner or venue network"
      >
        <form onSubmit={handleCreateOrg} className="space-y-4">
          <Input
            label="Organization Name"
            placeholder="e.g. Apex Arena Network"
            value={orgForm.name}
            onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
            required
          />
          <Input
            label="Industry"
            placeholder="Sports, Entertainment, Retail, etc."
            value={orgForm.industry}
            onChange={(e) => setOrgForm({ ...orgForm, industry: e.target.value })}
          />
          <Input
            label="Contact Email"
            type="email"
            placeholder="contact@org.com"
            value={orgForm.contactEmail}
            onChange={(e) => setOrgForm({ ...orgForm, contactEmail: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsOrgModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Organization</Button>
          </div>
        </form>
      </Modal>

      {/* Create Event Modal */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title="Schedule New Event"
        subtitle="Add a new live or digital event activation"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <Input
            label="Event Name"
            placeholder="e.g. World Esports Championship 2026"
            value={eventForm.name}
            onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
            required
          />
          <Input
            label="Venue Location"
            placeholder="e.g. Metropolis Dome, SF"
            value={eventForm.venue}
            onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
          />
          <Input
            label="Start Date"
            type="date"
            value={eventForm.startDate}
            onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsEventModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Schedule Event</Button>
          </div>
        </form>
      </Modal>

      {/* Invite User Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Team Member"
        subtitle="Send an access invitation to a team operator"
      >
        <form onSubmit={handleInviteUser} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="colleague@organization.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Send Invitation</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
