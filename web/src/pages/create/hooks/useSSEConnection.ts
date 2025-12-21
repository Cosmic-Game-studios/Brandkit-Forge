/**
 * Custom hook for managing Server-Sent Events (SSE) connections
 * 
 * Provides type-safe SSE handling with proper cleanup, error handling,
 * and automatic reconnection on connection failures.
 * 
 * @module useSSEConnection
 * 
 * @example
 * ```tsx
 * const { isConnected, error, connect, disconnect } = useSSEConnection({
 *   enabled: true,
 *   url: '/api/jobs/123/events',
 *   onMessage: (data) => console.log(data),
 *   onError: (error) => console.error(error),
 *   onComplete: () => console.log('Stream complete'),
 * });
 * ```
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface SSEMessage {
  cost?: { totalCost: number; apiCalls: number; breakdown: { backgrounds: number; heroes: number } };
  message?: string;
  status?: 'completed' | 'error';
}

export interface UseSSEConnectionOptions {
  enabled: boolean;
  url: string;
  onMessage?: (message: SSEMessage) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export interface UseSSEConnectionReturn {
  isConnected: boolean;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
}

/**
 * Custom hook for managing SSE connections with automatic cleanup
 */
export function useSSEConnection({
  enabled,
  url,
  onMessage,
  onError,
  onComplete,
}: UseSSEConnectionOptions): UseSSEConnectionReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    if (!enabled || !url) {
      return;
    }

    // Clean up existing connection
    disconnect();

    try {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      eventSource.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data) as SSEMessage;
          
          if (data.status === 'completed' || data.status === 'error') {
            onComplete?.();
            disconnect();
          }
          
          onMessage?.(data);
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Failed to parse SSE message');
          setError(error);
          onError?.(error);
        }
      };

      eventSource.onerror = (err) => {
        const error = err instanceof Error ? err : new Error('SSE connection error');
        setError(error);
        setIsConnected(false);
        onError?.(error);
        
        // Attempt reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          if (enabled) {
            connect();
          }
        }, 3000);
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create SSE connection');
      setError(error);
      onError?.(error);
    }
  }, [enabled, url, onMessage, onError, onComplete, disconnect]);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected,
    error,
    connect,
    disconnect,
  };
}
