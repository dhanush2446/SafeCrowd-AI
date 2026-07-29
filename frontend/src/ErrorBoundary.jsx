import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", background: "#fef2f2", color: "#991b1b", height: "100vh", overflow: "auto", fontFamily: "monospace" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}>App Crashed!</h1>
          <p style={{ fontWeight: "bold" }}>{this.state.error && this.state.error.toString()}</p>
          <pre style={{ marginTop: "20px", whiteSpace: "pre-wrap", background: "#fee2e2", padding: "10px", borderRadius: "8px" }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
