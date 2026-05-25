import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px", background: "#111", color: "#f87171", fontFamily: "monospace", height: "100vh", overflow: "auto" }}>
          <h1 style={{ color: "#ef4444" }}>App Crashed</h1>
          <p>Please copy this error and share it with the AI:</p>
          <pre style={{ background: "#222", padding: "20px", borderRadius: "8px", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {this.state.error && this.state.error.toString()}
            <br /><br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ marginTop: "20px", padding: "10px 20px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            Hard Reset App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
