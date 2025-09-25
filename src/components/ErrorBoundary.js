import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    // You can also log the error to an error reporting service here
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen dynamic-bg flex items-center justify-center px-4">
          <div className="glass-effect-dark rounded-3xl p-8 text-center max-w-md">
            <h1 className="text-2xl font-bold text-white mb-4">🎵 Oops! Something went wrong</h1>
            <p className="text-white/90 mb-4">The game encountered an unexpected error. Please try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-solid-1 text-white px-6 py-3 rounded-full text-lg font-semibold hover:scale-105 transform transition-all duration-300"
            >
              🔄 Refresh Game
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
