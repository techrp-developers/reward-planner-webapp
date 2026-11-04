// src/components/common/ErrorBoundary.jsx
import React from 'react';
import rpLogo from '../../assets/rp_logo_crisp.png';

// Lazily loaded pages (Payments, Services, ...) are separate files. After the dev server
// re-bundles or a new build is deployed, an open tab can ask for a file that no longer
// exists. That is not a bug in the page, so reload once to pick up the current files.
const CHUNK_ERROR = /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Loading chunk .+ failed|Outdated Optimize Dep/i;
const RELOAD_KEY = 'rp_chunk_reload_at';
const RELOAD_GUARD_MS = 10000; // never reload more than once in this window, so a real outage can't loop

const reloadForStaleChunk = (error) => {
  if (!CHUNK_ERROR.test(String(error?.message || error || ''))) return false;
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < RELOAD_GUARD_MS) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    return false;
  }
  window.location.reload();
  return true;
};

export class ErrorBoundary extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidMount() {
    window.addEventListener('vite:preloadError', this.handlePreloadError);
  }

  componentWillUnmount() {
    window.removeEventListener('vite:preloadError', this.handlePreloadError);
  }

  // Production builds report failed chunk preloads through this event
  handlePreloadError = (event) => {
    if (reloadForStaleChunk(event?.payload)) event.preventDefault();
  };

  componentDidCatch(error, errorInfo) {
    if (reloadForStaleChunk(error)) return;
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
