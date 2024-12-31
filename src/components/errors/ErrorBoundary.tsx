import React from 'react';
import ConnectionError from './ConnectionError';

interface ErrorBoundaryState {
  hasError: boolean;
  isConnectionError: boolean;
  errorMessage?: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { 
      hasError: false, 
      isConnectionError: false,
      errorMessage: undefined
    };
  }

  componentDidMount() {
    // Listen for connection errors
    window.addEventListener('api:connection-error', this.handleConnectionError);
  }

  componentWillUnmount() {
    window.removeEventListener('api:connection-error', this.handleConnectionError);
  }

  handleConnectionError = (event: Event) => {
    const customEvent = event as CustomEvent;
    this.setState({ 
      hasError: true, 
      isConnectionError: true,
      errorMessage: customEvent.detail?.message
    });
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState({ hasError: false, isConnectionError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.state.isConnectionError) {
        return (
          <ConnectionError 
            onRetry={this.handleRetry}
            message={this.state.errorMessage}
            fullPage
          />
        );
      }
      
      // Handle other types of errors here
      return null;
    }

    return this.props.children;
  }
} 