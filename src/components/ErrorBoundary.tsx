import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in CEC Drive:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-white dark:bg-black text-neutral-900 dark:text-white p-6 text-center">
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 mb-4">
            <AlertTriangle className="w-10 h-10 mx-auto" />
          </div>
          <h2 className="text-xl font-extrabold mb-2">CEC Drive Navigation Notice</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mb-6">
            An unexpected error occurred while loading this folder section. Click reload to refresh your workspace.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-md"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload CEC Drive</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
