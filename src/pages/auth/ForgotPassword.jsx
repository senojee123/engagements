import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      toast.success('Reset link sent to your email.');
    }, 600);
  };

  return (
    <div>
      <Link to="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Login
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reset Password</h1>
        <p className="text-sm text-slate-500 mt-1">
          Enter your registered email to receive password reset instructions.
        </p>
      </div>

      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button
            type="submit"
            isLoading={isLoading}
            icon={Send}
            iconPosition="right"
            className="w-full mt-2"
          >
            Send Instructions
          </Button>
        </form>
      ) : (
        <div className="p-6 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-center">
          <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Check your inbox</h3>
          <p className="text-xs text-slate-600 mt-1.5 mb-4">
            We sent a password reset link to <span className="font-semibold">{email}</span>.
          </p>
          <div className="flex flex-col gap-2">
            <Link to="/reset-password">
              <Button variant="outline" size="sm" className="w-full">
                Simulate Opening Reset Link
              </Button>
            </Link>
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-xs text-indigo-600 font-semibold hover:underline"
            >
              Didn't receive code? Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
