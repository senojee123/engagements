import React, { useState } from 'react';
import {
  Sliders,
  Shield,
  Palette,
  Layers,
  Check,
  Sparkles,
  Lock,
  Globe,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Dropdown from '../components/ui/Dropdown';
import Badge from '../components/ui/Badge';
import Tabs from '../components/ui/Tabs';
import Switch from '../components/ui/Switch';
import { useToast } from '../context/ToastContext';

export default function Settings() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('general');

  // Form states
  const [general, setGeneral] = useState({
    appName: 'FanForge Engagement OS',
    timezone: '(UTC-08:00) Pacific Time (US & Canada)',
    defaultLanguage: 'English (US)',
    dateFormat: 'YYYY-MM-DD',
  });

  const [security, setSecurity] = useState({
    twoFactor: true,
    sessionTimeout: '30 mins',
    passwordPolicy: 'Strict (12+ chars, numbers, symbols)',
  });

  const integrations = [
    { name: 'Slack', category: 'Chat Operations', icon: '💬', status: 'Coming Soon' },
    { name: 'Zapier', category: 'Automation Workflow', icon: '⚡', status: 'Coming Soon' },
    { name: 'HubSpot', category: 'CRM & Lead Capture', icon: '🟠', status: 'Coming Soon' },
    { name: 'Salesforce', category: 'Enterprise CRM', icon: '☁️', status: 'Coming Soon' },
    { name: 'Twilio SMS', category: 'Fan SMS Messaging', icon: '📱', status: 'Coming Soon' },
    { name: 'Stripe Payments', category: 'Ticket Paywalls', icon: '💳', status: 'Coming Soon' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure global platform parameters, security policies, and integrations.
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'general', label: 'General', icon: Sliders },
          { id: 'security', label: 'Security & Access', icon: Shield },
          { id: 'appearance', label: 'Appearance', icon: Palette },
          { id: 'integrations', label: 'Integrations', icon: Layers, badge: 'Soon' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Panels */}
      {activeTab === 'general' && (
        <Card>
          <CardHeader>
            <CardTitle>General Platform Configurations</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4 max-w-2xl">
            <Input
              label="System Display Name"
              value={general.appName}
              onChange={(e) => setGeneral({ ...general, appName: e.target.value })}
            />

            <Dropdown
              label="Primary Timezone"
              options={[
                { value: '(UTC-08:00) Pacific Time (US & Canada)', label: '(UTC-08:00) Pacific Time' },
                { value: '(UTC-05:00) Eastern Time (US & Canada)', label: '(UTC-05:00) Eastern Time' },
                { value: '(UTC+00:00) London, UTC', label: '(UTC+00:00) London' },
              ]}
              value={general.timezone}
              onChange={(val) => setGeneral({ ...general, timezone: val })}
            />

            <Dropdown
              label="System Date Format"
              options={[
                { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2026-08-15)' },
                { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (08/15/2026)' },
                { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (15/08/2026)' },
              ]}
              value={general.dateFormat}
              onChange={(val) => setGeneral({ ...general, dateFormat: val })}
            />

            <Button onClick={() => toast.success('General settings saved.')}>Save General Settings</Button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle>Security Policies & Controls</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6 max-w-2xl">
            <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Enforce Two-Factor Authentication (2FA)</h4>
                <p className="text-xs text-slate-500 mt-0.5">Require all organizers and admins to use authenticator app</p>
              </div>
              <Switch
                checked={security.twoFactor}
                onChange={(checked) => {
                  setSecurity({ ...security, twoFactor: checked });
                  toast.info('2FA setting updated.');
                }}
                label="Enforce Two-Factor Authentication"
              />
            </div>

            <Dropdown
              label="Session Inactivity Timeout"
              options={[
                { value: '15 mins', label: '15 minutes' },
                { value: '30 mins', label: '30 minutes (Recommended)' },
                { value: '1 hour', label: '1 hour' },
                { value: '4 hours', label: '4 hours' },
              ]}
              value={security.sessionTimeout}
              onChange={(val) => setSecurity({ ...security, sessionTimeout: val })}
            />

            <Button onClick={() => toast.success('Security policy saved.')}>Update Security Settings</Button>
          </CardContent>
        </Card>
      )}

      {activeTab === 'appearance' && (
        <Card>
          <CardHeader>
            <CardTitle>Appearance & Theme Styling</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6 max-w-2xl">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">Theme Selection</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border-2 border-indigo-600 bg-white flex items-center justify-between cursor-pointer shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                      L
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Enterprise Light Mode</h4>
                      <p className="text-xs text-slate-500">Default clean dashboard aesthetic</p>
                    </div>
                  </div>
                  <Check className="w-5 h-5 text-indigo-600" />
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-900 text-white flex items-center justify-between cursor-not-allowed opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-bold">
                      D
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Dark Arena Mode</h4>
                      <p className="text-xs text-slate-400">Phase 2 Release</p>
                    </div>
                  </div>
                  <Badge variant="slate" size="sm">
                    Soon
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'integrations' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center gap-3 text-indigo-900 text-xs">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
            <span>
              Integrations Hub is planned for Phase 2. Webhooks, Slack triggers, and CRM sync will be customizable per organization.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {integrations.map((integ) => (
              <Card key={integ.name} className="opacity-80">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{integ.icon}</span>
                    <Badge variant="slate" size="sm">
                      {integ.status}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{integ.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{integ.category}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
