import { Component } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

// React has no hook equivalent for error boundaries yet — must be a class component.
// Catches render-time errors anywhere below it in the tree, so one broken
// component shows a friendly screen instead of a blank white page.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // In a real production app this would also report to a logging service.
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-red-400" />
            </div>
            <h1 className="font-display text-xl font-bold text-slate-800 mb-2">Oops! Something went wrong</h1>
            <p className="text-slate-500 text-sm mb-6">
              An unexpected error occurred. Try reloading the page — if it keeps happening, please contact support.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => window.location.reload()}
                className="btn-primary px-5 py-2.5 text-sm rounded-xl flex items-center justify-center gap-2">
                <RotateCcw size={14} /> Reload
              </button>
              <button onClick={() => { window.location.href = '/'; }}
                className="btn-outline px-5 py-2.5 text-sm rounded-xl flex items-center justify-center gap-2">
                <Home size={14} /> Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;