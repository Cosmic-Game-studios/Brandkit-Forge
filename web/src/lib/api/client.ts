/**
 * Type-safe API client with proper error handling
 * 
 * Provides utilities for making HTTP requests with automatic error handling,
 * type safety, and consistent error responses.
 * 
 * @module api/client
 * 
 * @example
 * ```ts
 * // GET request
 * const { data } = await apiGet<User>('/api/user/123');
 * 
 * // POST request
 * const { data } = await apiPost<Result>('/api/create', { name: 'Test' });
 * ```
 */

import { APIError, NetworkError, getErrorMessage } from '../errors';

export interface APIResponse<T> {
  data: T;
  status: number;
  ok: boolean;
}

export interface APIErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

/**
 * Type-safe fetch wrapper with error handling
 */
export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<APIResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = (await response.json()) as T | APIErrorResponse;

    if (!response.ok) {
      const errorData = data as APIErrorResponse;
      throw new APIError(
        errorData.error || `HTTP ${response.status}`,
        response.status,
        url
      );
    }

    return {
      data: data as T,
      status: response.status,
      ok: response.ok,
    };
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new NetworkError(
      `Network request failed: ${getErrorMessage(error)}`,
      error
    );
  }
}

/**
 * Type-safe POST request with FormData support
 */
export async function apiPost<T>(
  url: string,
  body: FormData | Record<string, unknown>,
  options?: RequestInit
): Promise<APIResponse<T>> {
  const isFormData = body instanceof FormData;
  
  const requestOptions: RequestInit = {
    method: 'POST',
    ...options,
    body: isFormData ? body : JSON.stringify(body),
    headers: isFormData
      ? options?.headers
      : {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
  };

  return apiRequest<T>(url, requestOptions);
}

/**
 * Type-safe GET request
 */
export async function apiGet<T>(
  url: string,
  options?: RequestInit
): Promise<APIResponse<T>> {
  return apiRequest<T>(url, {
    method: 'GET',
    ...options,
  });
}
