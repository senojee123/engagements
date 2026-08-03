import React from 'react';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    localStorage.removeItem('fanforge_selfie_wall');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md shadow-2xl space-y-4">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-white">Something Went Wrong</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              An unexpected display state occurred. Click below to reset the cache and refresh the view.
            </p>
            {this.state.error && (
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-left text-[11px] font-mono text-red-300 max-h-36 overflow-auto">
                <p className="font-bold text-red-200">{this.state.error.toString()}</p>
                {this.state.error.stack && (
                  <pre className="text-[10px] text-slate-400 mt-1 whitespace-pre-wrap">
                    {this.state.error.stack.split('\n').slice(0, 4).join('\n')}
                  </pre>
                )}
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <RefreshCcw className="w-4 h-4" /> Reset Cache & Refresh
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
