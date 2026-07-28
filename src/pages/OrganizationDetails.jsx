import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  Users,
  Calendar,
  Shield,
  ExternalLink,
  Edit2,
  Plus,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Tabs from '../components/ui/Tabs';
import EmptyState from '../components/ui/EmptyState';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';

export default function OrganizationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { organizations, events } = useApp();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('overview');

  const org = organizations.find((o) => o.id === id);

  if (!org) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-slate-900">Organization Not Found</h2>
        <p className="text-sm text-slate-500 mt-2 mb-4">The organization you requested does not exist.</p>
        <Link to="/organizations">
          <Button variant="outline" icon={ArrowLeft}>
            Back to Organizations
          </Button>
        </Link>
      </div>
    );
  }

  // Filter events belonging to this org
  const orgEvents = events.filter((e) => e.organizationId === org.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back Link */}
      <Link to="/organizations" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Organizations
      </Link>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={org.logo}
            alt={org.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {org.name}
              </h1>
              <Badge variant="emerald" size="sm">
                {org.status}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
              <span className="font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                {org.industry}
              </span>
              <a
                href={org.website}
                target="_blank"
                rel="noreferrer"
                className="hover:underline flex items-center gap-1 text-slate-600"
              >
                <Globe className="w-3.5 h-3.5" /> {org.website} <ExternalLink className="w-3 h-3" />
              </a>
              <span className="flex items-center gap-1 text-slate-600">
                <Mail className="w-3.5 h-3.5" /> {org.contactEmail}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" icon={Edit2} onClick={() => toast.info('Edit mode enabled')}>
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'overview', label: 'overview' },
          { id: 'events', label: 'events' },
          { id: 'members', label: 'members' },
          { id: 'settings', label: 'settings' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About Organization</CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-sm text-slate-600 leading-relaxed">
                {org.description || 'No detailed bio available.'}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Associated Events ({orgEvents.length})</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/events')}>
                  View All
                </Button>
              </CardHeader>
              <CardContent className="p-6 divide-y divide-slate-100">
                {orgEvents.slice(0, 3).map((evt) => (
                  <div key={evt.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{evt.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{evt.venue} • {evt.startDate}</p>
                    </div>
                    <Badge variant={evt.status === 'Live' ? 'emerald' : 'indigo'} size="sm">
                      {evt.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Metrics</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Team Members</span>
                  <span className="text-sm font-bold text-slate-900">{org.memberCount}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Events Scheduled</span>
                  <span className="text-sm font-bold text-slate-900">{org.eventCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Registered Date</span>
                  <span className="text-sm font-bold text-slate-900">{org.createdAt}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Events for {org.name}</CardTitle>
            <Button size="sm" icon={Plus} onClick={() => navigate('/events')}>
              Schedule Event
            </Button>
          </CardHeader>
          <CardContent className="p-6 divide-y divide-slate-100">
            {orgEvents.map((evt) => (
              <div key={evt.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{evt.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {evt.type} • {evt.venue} • {evt.startDate} to {evt.endDate}
                  </p>
                </div>
                <Badge variant={evt.status === 'Live' ? 'emerald' : 'indigo'} size="sm">
                  {evt.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === 'members' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Team Members & Operators</CardTitle>
            <Button size="sm" icon={Plus} onClick={() => toast.info('Invite team member opened')}>
              Invite Member
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <EmptyState
              icon={Users}
              title="No team members added yet"
              description="Invite teammates to collaborate on this organization's events and engagements."
            />
          </CardContent>
        </Card>
      )}

      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle>Organization Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-slate-600">
              Configure custom domain routing, SSO authentication, and webhook notifications for {org.name}.
            </p>
            <Button variant="outline" size="sm" onClick={() => toast.info('Settings saved')}>
              Save Organization Settings
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
