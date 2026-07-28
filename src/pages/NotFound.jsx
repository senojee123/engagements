import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Compass } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-6 shadow-xs">
          <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '10s' }} />
        </div>

        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
        <h2 className="text-lg font-bold text-slate-800 mt-2">Page Not Found</h2>
        <p className="text-xs text-slate-500 mt-2 mb-8 leading-relaxed">
          The event page or route you are looking for does not exist or has been moved within the FanForge network.
        </p>

        <div className="flex flex-col gap-2.5">
          <Link to="/dashboard">
            <Button icon={Home} className="w-full">
              Back to Dashboard
            </Button>
          </Link>
          <Link to="/organizations">
            <Button variant="outline" icon={ArrowLeft} className="w-full">
              View Organizations
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
