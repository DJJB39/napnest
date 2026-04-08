import React from "react";

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] p-6 text-center bg-background">
          <div className="text-6xl mb-4">🌙</div>
          <h1 className="text-xl font-heading font-bold text-foreground mb-2">Something went wrong</h1>
          <p className="text-sm text-muted-foreground mb-6">Don't worry — your data is safe.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-sm"
          >
            Tap to reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
