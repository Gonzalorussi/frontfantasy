import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    console.error("Error capturado por ErrorBoundary:", error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Aquí podrías loguearlo a un sistema de logs si querés
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
          <h1 className="text-4xl font-bold">¡Oops! Algo salió mal.</h1>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
