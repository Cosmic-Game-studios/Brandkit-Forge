/**
 * Unit tests for error handling utilities
 */

import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  APIError,
  FileError,
  NetworkError,
  isAppError,
  isValidationError,
  isAPIError,
  getErrorMessage,
  getErrorCode,
} from './errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an AppError with default status code', () => {
      const error = new AppError('Test error', 'TEST_ERROR');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('AppError');
    });

    it('should create an AppError with custom status code', () => {
      const error = new AppError('Test error', 'TEST_ERROR', 400);
      expect(error.statusCode).toBe(400);
    });

    it('should preserve cause', () => {
      const cause = new Error('Original error');
      const error = new AppError('Test error', 'TEST_ERROR', 500, cause);
      expect(error.cause).toBe(cause);
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError', () => {
      const error = new ValidationError('Invalid input', 'fieldName');
      expect(error).toBeInstanceOf(ValidationError);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.field).toBe('fieldName');
    });
  });

  describe('APIError', () => {
    it('should create an APIError', () => {
      const error = new APIError('API request failed', 404, '/api/test');
      expect(error).toBeInstanceOf(APIError);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('API request failed');
      expect(error.code).toBe('API_ERROR');
      expect(error.statusCode).toBe(404);
      expect(error.endpoint).toBe('/api/test');
    });
  });

  describe('FileError', () => {
    it('should create a FileError', () => {
      const error = new FileError('File not found', 'test.png');
      expect(error).toBeInstanceOf(FileError);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('File not found');
      expect(error.code).toBe('FILE_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.fileName).toBe('test.png');
    });
  });

  describe('NetworkError', () => {
    it('should create a NetworkError', () => {
      const originalError = new Error('Connection failed');
      const error = new NetworkError('Network request failed', originalError);
      expect(error).toBeInstanceOf(NetworkError);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Network request failed');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.statusCode).toBe(0);
      expect(error.originalError).toBe(originalError);
    });
  });
});

describe('Type Guards', () => {
  describe('isAppError', () => {
    it('should return true for AppError instances', () => {
      const error = new AppError('Test', 'TEST');
      expect(isAppError(error)).toBe(true);
    });

    it('should return true for ValidationError instances', () => {
      const error = new ValidationError('Test');
      expect(isAppError(error)).toBe(true);
    });

    it('should return false for regular Error', () => {
      const error = new Error('Test');
      expect(isAppError(error)).toBe(false);
    });

    it('should return false for non-error values', () => {
      expect(isAppError(null)).toBe(false);
      expect(isAppError(undefined)).toBe(false);
      expect(isAppError('string')).toBe(false);
      expect(isAppError(123)).toBe(false);
    });
  });

  describe('isValidationError', () => {
    it('should return true for ValidationError instances', () => {
      const error = new ValidationError('Test');
      expect(isValidationError(error)).toBe(true);
    });

    it('should return false for other error types', () => {
      const error = new AppError('Test', 'TEST');
      expect(isValidationError(error)).toBe(false);
    });
  });

  describe('isAPIError', () => {
    it('should return true for APIError instances', () => {
      const error = new APIError('Test', 500);
      expect(isAPIError(error)).toBe(true);
    });

    it('should return false for other error types', () => {
      const error = new AppError('Test', 'TEST');
      expect(isAPIError(error)).toBe(false);
    });
  });
});

describe('Error Utilities', () => {
  describe('getErrorMessage', () => {
    it('should extract message from Error', () => {
      const error = new Error('Test error');
      expect(getErrorMessage(error)).toBe('Test error');
    });

    it('should extract message from AppError', () => {
      const error = new AppError('App error', 'APP_ERROR');
      expect(getErrorMessage(error)).toBe('App error');
    });

    it('should return string for string errors', () => {
      expect(getErrorMessage('String error')).toBe('String error');
    });

    it('should return default message for unknown types', () => {
      expect(getErrorMessage(null)).toBe('An unknown error occurred');
      expect(getErrorMessage(undefined)).toBe('An unknown error occurred');
      expect(getErrorMessage(123)).toBe('An unknown error occurred');
      expect(getErrorMessage({})).toBe('An unknown error occurred');
    });
  });

  describe('getErrorCode', () => {
    it('should extract code from AppError', () => {
      const error = new AppError('Test', 'TEST_CODE');
      expect(getErrorCode(error)).toBe('TEST_CODE');
    });

    it('should return default code for non-AppError', () => {
      const error = new Error('Test');
      expect(getErrorCode(error)).toBe('UNKNOWN_ERROR');
    });
  });
});
