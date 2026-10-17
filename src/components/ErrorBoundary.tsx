import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Tactical Rig ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#08090b] text-slate-100 p-6 select-none">
          <div className="tactical-glass p-8 rounded-2xl max-w-lg w-full border border-rose-500/30 shadow-[0_0_50px_rgba(244,63,94,0.2)] text-center">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-7 h-7" />
              </div>
            </div>
            <h2 className="text-lg font-bold font-sans-tactical uppercase tracking-wider text-rose-300 mb-2">
              RIG TELEMETRY EXCEPTION
            </h2>
            <p className="font-mono-telemetry text-xs text-slate-400 mb-4">
              {this.state.error?.message || 'Unexpected WebGL / Canvas execution fault.'}
            </p>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold font-mono-telemetry text-xs uppercase shadow-[0_0_20px_#f59e0b] transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RESTART TELEMETRY STREAM</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
