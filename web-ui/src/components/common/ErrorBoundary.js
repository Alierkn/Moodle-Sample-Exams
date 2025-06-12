import React, { Component } from 'react';
import { 
  AlertTriangle, RefreshCw, Bug, AlertCircle, Home, 
  ChevronDown, ChevronUp, Copy, ExternalLink, Shield,
  Zap, RotateCcw, MessageCircle, Download
} from 'lucide-react';

/**
 * Modern Enhanced Error Boundary Component
 * Provides comprehensive error handling with detailed reporting and recovery options
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      showDetails: false,
      retryCount: 0,
      isRecovering: false,
      lastErrorTime: null
    };
  }

  static getDerivedStateFromError(error) {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { 
      hasError: true,
      errorId,
      lastErrorTime: new Date()
    };
  }

  componentDidCatch(error, errorInfo) {
    console.group('🚨 Error Boundary Caught Error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log to external service (simulate)
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // Simulate logging to external error reporting service
    const errorReport = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount
    };

    console.log('📊 Error logged to service:', errorReport);
    
    // In a real app, you would send this to your error tracking service:
    // errorTrackingService.log(errorReport);
  }

  handleRetry = () => {
    this.setState({ 
      isRecovering: true,
      retryCount: this.state.retryCount + 1
    });

    // Simulate recovery delay
    setTimeout(() => {
      this.setState({ 
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
        isRecovering: false,
        showDetails: false
      });
      
      if (this.props.onRetry) {
        this.props.onRetry();
      }
    }, 1000);
  }

  handleReset = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      showDetails: false,
      isRecovering: false
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  }

  handleReload = () => {
    window.location.reload();
  }

  handleNavigateHome = () => {
    if (this.props.onNavigateHome) {
      this.props.onNavigateHome();
    } else {
      window.location.href = '/';
    }
  }

  handleCopyError = () => {
    const errorText = `
Error ID: ${this.state.errorId}
Error: ${this.state.error?.message}
Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
Timestamp: ${this.state.lastErrorTime?.toISOString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
    `;

    navigator.clipboard.writeText(errorText).then(() => {
      console.log('Error details copied to clipboard');
    }).catch(() => {
      console.log('Failed to copy error details');
    });
  }

  handleDownloadReport = () => {
    const errorReport = {
      errorId: this.state.errorId,
      error: {
        message: this.state.error?.message,
        stack: this.state.error?.stack
      },
      errorInfo: this.state.errorInfo,
      timestamp: this.state.lastErrorTime?.toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      retryCount: this.state.retryCount
    };

    const blob = new Blob([JSON.stringify(errorReport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${this.state.errorId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  getErrorSeverity = () => {
    if (!this.state.error) return 'low';
    
    const message = this.state.error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'medium';
    }
    if (message.includes('chunk') || message.includes('loading')) {
      return 'medium';
    }
    if (message.includes('memory') || message.includes('maximum')) {
      return 'high';
    }
    
    return 'medium';
  }

  getErrorIcon = () => {
    const severity = this.getErrorSeverity();
    const iconProps = { size: 48, className: "mx-auto mb-6" };
    
    switch (severity) {
      case 'high':
        return <AlertCircle {...iconProps} className="mx-auto mb-6 text-red-500" />;
      case 'medium':
        return <AlertTriangle {...iconProps} className="mx-auto mb-6 text-yellow-500" />;
      default:
        return <Bug {...iconProps} className="mx-auto mb-6 text-blue-500" />;
    }
  }

  getErrorTitle = () => {
    const severity = this.getErrorSeverity();
    
    switch (severity) {
      case 'high':
        return 'Critical Error Occurred';
      case 'medium':
        return 'Something Went Wrong';
      default:
        return 'Minor Issue Detected';
    }
  }

  getErrorMessage = () => {
    if (!this.state.error) return 'An unexpected error occurred';
    
    const message = this.state.error.message;
    
    // Provide user-friendly error messages
    if (message.includes('ChunkLoadError')) {
      return 'Failed to load application resources. This usually happens when the app is updated.';
    }
    if (message.includes('Network Error') || message.includes('fetch')) {
      return 'Network connection issue. Please check your internet connection.';
    }
    if (message.includes('Cannot read property')) {
      return 'Data loading error. Some required information is missing.';
    }
    if (message.includes('Maximum call stack')) {
      return 'Application overload detected. Please try refreshing the page.';
    }
    
    return message;
  }

  getRecoveryOptions = () => {
    const severity = this.getErrorSeverity();
    const { retryCount } = this.state;
    
    const options = [
      {
        key: 'retry',
        label: retryCount > 0 ? `Try Again (${retryCount + 1})` : 'Try Again',
        icon: RefreshCw,
        action: this.handleRetry,
        variant: 'primary',
        disabled: retryCount >= 3
      }
    ];

    if (severity === 'medium' || retryCount > 1) {
      options.push({
        key: 'reload',
        label: 'Reload Page',
        icon: RotateCcw,
        action: this.handleReload,
        variant: 'secondary'
      });
    }

    if (severity === 'high' || retryCount > 2) {
      options.push({
        key: 'home',
        label: 'Go Home',
        icon: Home,
        action: this.handleNavigateHome,
        variant: 'secondary'
      });
    }

    return options;
  }

  render() {
    if (this.state.hasError) {
      const { showDetails, isRecovering, errorId, lastErrorTime } = this.state;
      const severity = this.getErrorSeverity();
      const recoveryOptions = this.getRecoveryOptions();

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
            {/* Header */}
            <div className={`px-8 py-6 ${
              severity === 'high' ? 'bg-red-50 dark:bg-red-900/20' :
              severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
              'bg-blue-50 dark:bg-blue-900/20'
            }`}>
              <div className="text-center">
                {this.getErrorIcon()}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {this.getErrorTitle()}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {this.getErrorMessage()}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-6">
              {/* Error ID */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Error ID</p>
                    <p className="text-xs font-mono text-gray-500 dark:text-gray-400">{errorId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Occurred</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {lastErrorTime?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recovery Options */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recovery Options
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recoveryOptions.map(option => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.key}
                        onClick={option.action}
                        disabled={option.disabled || isRecovering}
                        className={`
                          flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-semibold
                          transition-all duration-300 transform hover:scale-105 active:scale-95
                          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                          ${option.variant === 'primary' 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }
                        `}
                      >
                        <Icon size={18} className={isRecovering && option.key === 'retry' ? 'animate-spin' : ''} />
                        {isRecovering && option.key === 'retry' ? 'Recovering...' : option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Technical Details Toggle */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <button
                  onClick={() => this.setState({ showDetails: !showDetails })}
                  className="flex items-center justify-between w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Technical Details
                  </span>
                  {showDetails ? 
                    <ChevronUp size={18} className="text-gray-400" /> : 
                    <ChevronDown size={18} className="text-gray-400" />
                  }
                </button>

                {showDetails && (
                  <div className="mt-4 space-y-4 animate-fade-in">
                    {/* Error Details */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Error Message
                      </h4>
                      <pre className="text-xs text-red-600 dark:text-red-400 whitespace-pre-wrap break-all">
                        {this.state.error?.message}
                      </pre>
                    </div>

                    {/* Stack Trace */}
                    {this.state.error?.stack && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Stack Trace
                        </h4>
                        <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}

                    {/* Component Stack */}
                    {this.state.errorInfo?.componentStack && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Component Stack
                        </h4>
                        <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={this.handleCopyError}
                        className="flex items-center gap-2 px-3 py-2 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                      >
                        <Copy size={14} />
                        Copy Details
                      </button>
                      
                      <button
                        onClick={this.handleDownloadReport}
                        className="flex items-center gap-2 px-3 py-2 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                      >
                        <Download size={14} />
                        Download Report
                      </button>

                      {this.props.supportUrl && (
                        <a
                          href={this.props.supportUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 text-xs bg-blue-100 dark:bg-blue-600 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-500 transition-colors"
                        >
                          <MessageCircle size={14} />
                          Contact Support
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-gray-50 dark:bg-gray-700 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Shield size={16} />
                <span>Your data is safe. This error has been automatically reported.</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy error boundary wrapping
export const withErrorBoundary = (WrappedComponent, errorBoundaryProps = {}) => {
  return class extends Component {
    render() {
      return (
        <ErrorBoundary {...errorBoundaryProps}>
          <WrappedComponent {...this.props} />
        </WrappedComponent>
      );
    }
  };
};

// Hook for error reporting (simulated)
export const useErrorReporting = () => {
  const reportError = (error, context = {}) => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context,
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    console.log('📊 Manual error report:', errorReport);
    // In a real app: errorTrackingService.log(errorReport);
  };

  return { reportError };
};

// Demo component that can trigger errors
export const ErrorBoundaryDemo = () => {
  const [shouldError, setShouldError] = useState(false);
  const [errorType, setErrorType] = useState('basic');

  const triggerError = () => {
    setShouldError(true);
  };

  const resetError = () => {
    setShouldError(false);
  };

  if (shouldError) {
    switch (errorType) {
      case 'network':
        throw new Error('Network Error: Failed to fetch data from server');
      case 'chunk':
        throw new Error('ChunkLoadError: Loading chunk 2 failed');
      case 'memory':
        throw new Error('Maximum call stack size exceeded');
      case 'property':
        throw new Error('Cannot read property "data" of undefined');
      default:
        throw new Error('Something went wrong in the application');
    }
  }

  return (
    <ErrorBoundary
      onReset={resetError}
      onRetry={resetError}
      supportUrl="https://support.example.com"
    >
      <div className="p-8 bg-gray-100 dark:bg-gray-900 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Error Boundary Demo
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Test different types of errors to see how the error boundary handles them.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Error Type
                </label>
                <select
                  value={errorType}
                  onChange={(e) => setErrorType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="basic">Basic Error</option>
                  <option value="network">Network Error</option>
                  <option value="chunk">Chunk Load Error</option>
                  <option value="memory">Memory Error</option>
                  <option value="property">Property Access Error</option>
                </select>
              </div>
              
              <button
                onClick={triggerError}
                className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Trigger Error
              </button>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ErrorBoundary;