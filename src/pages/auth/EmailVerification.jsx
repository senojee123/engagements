import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

export default function EmailVerification() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleVerify = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Email verified successfully! Opening Dashboard.');
      navigate('/dashboard');
    }, 600);
  };

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-4 shadow-xs">
        <Mail className="w-8 h-8" />
      </div>

      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Verify Your Email</h1>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2 mb-6">
        We sent a 6-digit confirmation code to your work email address.
      </p>

      {/* Code Input Boxes */}
      <div className="flex justify-center gap-2 mb-6">
        {code.map((digit, idx) => (
          <input
            key={idx}
            id={`code-input-${idx}`}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleCodeChange(idx, e.target.value)}
            className="w-11 h-12 text-center text-lg font-bold bg-white border border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:outline-none transition-all shadow-xs"
          />
        ))}
      </div>

      <Button
        onClick={handleVerify}
        isLoading={isLoading}
        icon={ArrowRight}
        iconPosition="right"
        className="w-full"
      >
        Confirm & Continue
      </Button>

      <div className="mt-6 flex flex-col items-center gap-2 text-xs text-slate-500">
        <button
          onClick={() => toast.info('New verification code sent!')}
          className="text-indigo-600 font-semibold hover:underline"
        >
          Resend verification code
        </button>
        <Link to="/login" className="hover:underline">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
