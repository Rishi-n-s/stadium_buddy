import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-surface-container text-on-surface min-h-screen flex flex-col items-center justify-center font-body-md">
          <div className="glass-overlay mechanical-border p-8 rounded-2xl max-w-lg text-center">
            <span className="material-symbols-outlined text-error text-6xl mb-4">error</span>
            <h2 className="text-headline-md font-bold mb-2">Something went wrong</h2>
            <p className="text-on-surface-variant mb-6">We encountered an unexpected error. Please try refreshing the page or returning to the hub.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary text-white px-6 py-2 rounded-lg font-bold tactile-button"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
