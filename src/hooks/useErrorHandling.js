import { useState, useCallback, useEffect } from 'react';

export const useErrorHandling = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Error types
  const ERROR_TYPES = {
    AUDIO_ERROR: 'AUDIO_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    GAME_ERROR: 'GAME_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
  };

  // Handle different types of errors
  const handleError = useCallback((error, type = ERROR_TYPES.UNKNOWN_ERROR) => {
    console.error(`[${type}]`, error);
    
    const errorInfo = {
      type,
      message: getErrorMessage(error, type),
      timestamp: new Date().toISOString(),
      retryCount
    };

    setError(errorInfo);

    // Auto-retry for certain error types
    if (type === ERROR_TYPES.AUDIO_ERROR && retryCount < 3) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setError(null);
      }, 2000);
    }
  }, [retryCount]);

  // Get user-friendly error messages
  const getErrorMessage = (error, type) => {
    switch (type) {
      case ERROR_TYPES.AUDIO_ERROR:
        return "There was an issue with the audio system. Please try refreshing the page.";
      case ERROR_TYPES.NETWORK_ERROR:
        return "Network connection issue. Please check your internet connection.";
      case ERROR_TYPES.GAME_ERROR:
        return "Game encountered an error. Please try again.";
      default:
        return error?.message || "Something went wrong. Please try again.";
    }
  };

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  // Retry function
  const retry = useCallback((retryFn) => {
    if (retryFn && typeof retryFn === 'function') {
      setIsLoading(true);
      setError(null);
      
      try {
        retryFn();
      } catch (err) {
        handleError(err, ERROR_TYPES.UNKNOWN_ERROR);
      } finally {
        setIsLoading(false);
      }
    }
  }, [handleError]);

  // Loading state management
  const setLoading = useCallback((loading) => {
    setIsLoading(loading);
  }, []);

  // Error boundary handler
  const handleErrorBoundary = useCallback((error, errorInfo) => {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    const errorData = {
      type: ERROR_TYPES.UNKNOWN_ERROR,
      message: "The app encountered an unexpected error. Please refresh the page.",
      timestamp: new Date().toISOString(),
      componentStack: errorInfo.componentStack,
      retryCount: 0
    };

    setError(errorData);
  }, []);

  // Auto-clear errors after timeout
  useEffect(() => {
    if (error && error.type !== ERROR_TYPES.AUDIO_ERROR) {
      const timer = setTimeout(() => {
        clearError();
      }, 10000); // Auto-clear after 10 seconds

      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  return {
    error,
    isLoading,
    retryCount,
    ERROR_TYPES,
    handleError,
    clearError,
    retry,
    setLoading,
    handleErrorBoundary
  };
};
