import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Building, Mail, Lock, ArrowRight } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Dropdown from '../../components/ui/Dropdown';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Brand');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, availableRoles } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const roleOptions = availableRoles.map((r) => ({
    id: r.id,
    value: r.id,
    label: `${r.name} - ${r.description.slice(0, 40)}...`,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !companyName || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const res = await register({ fullName, companyName, email, password, role });
      toast.success('Account created successfully! Welcome to FanForge.');
      const userRole = res?.user?.role || role;
      if (userRole === 'Brand') {
        navigate('/analytics');
      } else if (userRole === 'Developer') {
        navigate('/library');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Unable to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = (provider) => {
    toast.info(`Social sign-up via ${provider} is not available in this demo build.`);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Create FanForge Account
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Start building interactive fan experiences in minutes.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {/* Social Logins */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => handleSocialRegister('Google')}
          className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
            />
          </svg>
          Google
        </button>

        <button
          type="button"
          onClick={() => handleSocialRegister('Microsoft')}
          className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 23 23">
            <path fill="#f35325" d="M1 1h10v10H1z" />
            <path fill="#81bc06" d="M12 1h10v10H12z" />
            <path fill="#05a6f0" d="M1 12h10v10H1z" />
            <path fill="#ffba08" d="M12 12h10v10H12z" />
          </svg>
          Microsoft
        </button>
      </div>

      <div className="relative flex items-center justify-center mb-6">
        <div className="border-t border-slate-200 w-full" />
        <span className="bg-white px-3 text-xs text-slate-400 uppercase tracking-wider font-semibold absolute">
          Or fill register details
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          icon={User}
          placeholder="e.g. Jordan Taylor"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <Input
          label="Company / Organization Name"
          type="text"
          icon={Building}
          placeholder="e.g. Global Arena Network"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />

        <Input
          label="Work Email Address"
          type="email"
          icon={Mail}
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Dropdown
          label="Primary Role"
          options={roleOptions}
          value={role}
          onChange={(val) => setRole(val)}
        />

        <Input
          label="Password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          icon={Lock}
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button
          type="submit"
          isLoading={isLoading}
          icon={ArrowRight}
          iconPosition="right"
          className="w-full mt-2"
        >
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        Already registered?{' '}
        <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
          Sign in instead
        </Link>
      </p>
    </div>
  );
}
