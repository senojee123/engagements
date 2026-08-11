import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Building,
  Lock,
  Bell,
  Camera,
  Shield,
  Save,
  CheckCircle2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Tabs from '../components/ui/Tabs';
import Switch from '../components/ui/Switch';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { changePasswordApi } from '../lib/api';

export default function Profile() {
  const { user, updateProfile, deleteAccount, currentRole } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('personal');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [personal, setPersonal] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    title: user?.title || '',
    bio: user?.bio || '',
  });

  const [company, setCompany] = useState({
    companyName: user?.company || '',
    industry: user?.companyIndustry || '',
    website: user?.companyWebsite || '',
    hqAddress: user?.companyAddress || '',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: '',
  });

  const handleSavePersonal = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(personal);
      toast.success('Personal profile updated successfully.');
    } catch (err) {
      toast.error(err.message || 'Unable to update profile.');
    }
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        company: company.companyName,
        companyIndustry: company.industry,
        companyWebsite: company.website,
        companyAddress: company.hqAddress,
      });
      toast.success('Company profile updated successfully.');
    } catch (err) {
      toast.error(err.message || 'Unable to update company info.');
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.newPass) {
      toast.error('Please enter both current and new password.');
      return;
    }
    if (passwords.newPass !== passwords.confirmPass) {
      toast.error('New passwords do not match.');
      return;
    }
    try {
      await changePasswordApi(user.id, { currentPassword: passwords.current, newPassword: passwords.newPass });
      toast.success('Password changed successfully.');
      setPasswords({ current: '', newPass: '', confirmPass: '' });
    } catch (err) {
      toast.error(err.message || 'Unable to change password.');
    }
  };

  const handleToggleNotification = async (key, checked, label) => {
    try {
      await updateProfile({ [key]: checked });
      toast.info(`Updated preference for ${label}`);
    } catch (err) {
      toast.error(err.message || 'Unable to update preference.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{user?.name}</h1>
              <Badge variant="indigo" size="sm">
                {currentRole}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {user?.title} • {user?.company}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'personal', label: 'Personal Information', icon: User },
          { id: 'company', label: 'Company Information', icon: Building },
          { id: 'security', label: 'Change Password', icon: Lock },
          { id: 'notifications', label: 'Notification Preferences', icon: Bell },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab Panels */}
      {activeTab === 'personal' && (
        <Card>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSavePersonal} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={personal.name}
                  onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
                  required
                />
                <Input
                  label="Job Title"
                  value={personal.title}
                  onChange={(e) => setPersonal({ ...personal, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  value={personal.email}
                  onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                  required
                />
                <Input
                  label="Phone Number"
                  value={personal.phone}
                  onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
                <textarea
                  rows={3}
                  value={personal.bio}
                  onChange={(e) => setPersonal({ ...personal, bio: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:outline-none transition-all"
                />
              </div>

              <Button type="submit" icon={Save}>
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'company' && (
        <Card>
          <CardHeader>
            <CardTitle>Company & Organization Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSaveCompany} className="space-y-4 max-w-2xl">
              <Input
                label="Company Name"
                value={company.companyName}
                onChange={(e) => setCompany({ ...company, companyName: e.target.value })}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Industry"
                  value={company.industry}
                  onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                />
                <Input
                  label="Company Website"
                  value={company.website}
                  onChange={(e) => setCompany({ ...company, website: e.target.value })}
                />
              </div>

              <Input
                label="Headquarters Address"
                value={company.hqAddress}
                onChange={(e) => setCompany({ ...company, hqAddress: e.target.value })}
              />

              <Button type="submit" icon={Save}>
                Update Company Info
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSavePassword} className="space-y-4 max-w-md">
              <Input
                label="Current Password"
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                required
              />
              <Input
                label="New Password"
                type="password"
                value={passwords.newPass}
                onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={passwords.confirmPass}
                onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
                required
              />
              <Button type="submit" icon={Lock}>
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4 max-w-xl">
            {Object.entries({
              emailAlerts: { label: 'Email Notifications', desc: 'Receive real-time event alerts and invitations.' },
              pushNotifs: { label: 'In-App Push Alerts', desc: 'Notify when new users join or events go live.' },
              weeklyReport: { label: 'Weekly Summary Digest', desc: 'Receive weekly attendance performance metrics.' },
              securityAlerts: { label: 'Security & Access Logs', desc: 'Get immediate alerts on new IP logins.' },
            }).map(([key, item]) => (
              <div key={key} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.label}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
                <Switch
                  checked={!!user?.[key]}
                  onChange={(checked) => handleToggleNotification(key, checked, item.label)}
                  label={item.label}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Danger Zone: Account Deletion */}
      <div className="pt-4">
        <Card className="border-rose-200/90 bg-rose-50/30">
          <CardHeader className="border-rose-100">
            <CardTitle className="text-rose-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Delete Account</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-lg">
                Permanently delete your FanForge account and remove all personal information, brand settings, and active sessions. This action cannot be undone.
              </p>
            </div>
            <Button
              variant="danger"
              icon={Trash2}
              onClick={() => setIsDeleteModalOpen(true)}
              className="shrink-0"
            >
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Account Deletion Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          setIsDeleting(true);
          try {
            await deleteAccount();
            toast.success('Your account has been deleted successfully.');
            navigate('/login');
          } catch (err) {
            toast.error(err.message || 'Unable to delete account.');
          } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
          }
        }}
        title="Delete Account"
        message="Are you sure you want to permanently delete your account? All your profile settings, brand assets, and permissions will be removed immediately. This action cannot be undone."
        confirmText="Yes, Delete Account"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
