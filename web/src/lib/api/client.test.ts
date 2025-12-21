/**
 * Unit tests for API client utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiRequest, apiPost, apiGet, APIError, NetworkError } from './client';

// Mock fetch
global.fetch = vi.fn();

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('apiRequest', () => {
    it('should make a successful request', async () => {
      const mockData = { id: '123', name: 'Test' };
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await apiRequest<typeof mockData>('/api/test');

      expect(result.data).toEqual(mockData);
      expect(result.status).toBe(200);
      expect(result.ok).toBe(true);
      expect(fetch).toHaveBeenCalledWith('/api/test', {
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should throw APIError on HTTP error', async () => {
      const errorData = { error: 'Not found', code: 'NOT_FOUND' };
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => errorData,
      });

      await expect(apiRequest('/api/test')).rejects.toThrow(APIError);
      await expect(apiRequest('/api/test')).rejects.toThrow('Not found');
    });

    it('should throw NetworkError on fetch failure', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

      await expect(apiRequest('/api/test')).rejects.toThrow(NetworkError);
    });

    it('should include custom headers', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

      await apiRequest('/api/test', {
        headers: { 'Authorization': 'Bearer token' },
      });

      expect(fetch).toHaveBeenCalledWith('/api/test', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token',
        },
      });
    });
  });

  describe('apiPost', () => {
    it('should POST JSON data', async () => {
      const mockData = { success: true };
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockData,
      });

      const result = await apiPost('/api/test', { name: 'Test' });

      expect(result.data).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should POST FormData without Content-Type header', async () => {
      const formData = new FormData();
      formData.append('file', new Blob(['test']));
      
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ success: true }),
      });

      await apiPost('/api/test', formData);

      expect(fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        body: formData,
        headers: {},
      });
    });
  });

  describe('apiGet', () => {
    it('should make a GET request', async () => {
      const mockData = { items: [1, 2, 3] };
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await apiGet<typeof mockData>('/api/test');

      expect(result.data).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });
});
