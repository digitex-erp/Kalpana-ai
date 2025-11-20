// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // FIX: Switched from a constructor to class property state initialization.
  // The constructor-based approach was causing type errors where properties like 'state' and 'props'
  // were not being correctly recognized on the component instance. Using a class property
  // for state is a modern and robust alternative that resolves these issues.
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        // The error is guaranteed to exist if hasError is true.
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-200 p-4">
          <div className="bg-red-900/40 border border-red-700/60 text-red-200 rounded-lg p-8 max-w-lg w-full text-center">
            <h1 className="text-2xl font-bold mb-4">⚠️ Something went wrong.</h1>
            <p className="mb-6">An unexpected error occurred. Please try again.</p>
            <button
              onClick={this.resetError}
              className="mt-6 py-2 px-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition-colors"
            >
              Try again
            </button>
             {this.state.error && (
                <details className="text-left bg-gray-800 p-4 rounded-md text-sm overflow-auto mt-4">
                    <summary className="cursor-pointer">Error Details</summary>
                    <pre className="mt-2 whitespace-pre-wrap">
                        {this.state.error.toString()}
                    </pre>
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
