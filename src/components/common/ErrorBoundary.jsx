// src/components/common/ErrorBoundary.jsx
import React from 'react';
import rpLogo from '../../assets/rplogo_nobg.svg';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error in React tree:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Could not clear storage:', e);
    }
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-r from-[#8b3ab5] to-[#a855f7] p-4 font-['Poppins',sans-serif]">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/60 text-center space-y-5 animate-fadeIn">
            <div className="flex justify-center">
              <div className="p-3 rounded-2xl bg-[#8b3ab5]/10 border border-[#8b3ab5]/25">
                <img src={rpLogo} alt="Reward Planners" className="h-10 w-auto object-contain" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                Application Recovered
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                An unexpected display issue occurred. You can reload the page or reset the app session to continue.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#8b3ab5] to-[#a855f7] hover:opacity-95 shadow-md cursor-pointer transition-all"
              >
                Reload Application
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-2 px-4 rounded-xl font-semibold text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 cursor-pointer transition-all"
              >
                Clear Cache & Reset
              </button>
            </div>

            {this.state.error?.message && (
              <details className="text-left text-[11px] text-gray-400 border-t border-gray-100 pt-3">
                <summary className="cursor-pointer font-medium hover:text-gray-600">
                  Technical Details
                </summary>
                <p className="mt-1 font-mono text-rose-500 break-words">
                  {String(this.state.error.message)}
                </p>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
