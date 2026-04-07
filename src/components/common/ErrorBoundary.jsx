import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-surface-50 font-sans">
          <div className="bg-white rounded-[2.5rem] shadow-modal border border-surface-100 p-12 max-w-md w-full text-center space-y-6 animate-fadeIn">
            <div className="w-20 h-20 bg-red-50 border border-red-100 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-3xl tracking-tighter text-surface-900">Clinical System Error</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-surface-400 mt-1">Diagnostic Fault Identified</p>
            </div>
            <div className="p-4 bg-surface-50 rounded-2xl border border-surface-100 font-mono text-[11px] text-surface-600 break-all">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </div>
            <p className="text-sm text-surface-500 max-w-[280px] mx-auto">
              The application encountered a runtime exception. Please re-initialize the clinical portal.
            </p>
            <button
              className="btn-primary w-full py-4 text-base"
              onClick={() => window.location.reload()}
            >
              Refresh Portal
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
