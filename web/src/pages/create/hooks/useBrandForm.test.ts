/**
 * Unit tests for useBrandForm hook
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBrandForm } from './useBrandForm';

describe('useBrandForm', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useBrandForm());

    expect(result.current.state.name).toBe('');
    expect(result.current.state.logoFile).toBeNull();
    expect(result.current.state.colors).toEqual([]);
    expect(result.current.state.selectedStyles).toEqual([]);
    expect(result.current.state.format).toBe('png');
    expect(result.current.state.quality).toBe('high');
  });

  it('should initialize with provided values', () => {
    const initialState = {
      name: 'Test Brand',
      colors: ['#FF0000'],
      format: 'webp' as const,
    };

    const { result } = renderHook(() => useBrandForm(initialState));

    expect(result.current.state.name).toBe('Test Brand');
    expect(result.current.state.colors).toEqual(['#FF0000']);
    expect(result.current.state.format).toBe('webp');
  });

  it('should add color', () => {
    const { result } = renderHook(() => useBrandForm());

    act(() => {
      result.current.actions.addColor();
    });

    expect(result.current.state.colors).toHaveLength(1);
    expect(result.current.state.colors[0]).toBe('#6D28D9');
  });

  it('should remove color', () => {
    const { result } = renderHook(() => useBrandForm({
      colors: ['#FF0000', '#00FF00', '#0000FF'],
    }));

    act(() => {
      result.current.actions.removeColor(1);
    });

    expect(result.current.state.colors).toEqual(['#FF0000', '#0000FF']);
  });

  it('should update color', () => {
    const { result } = renderHook(() => useBrandForm({
      colors: ['#FF0000', '#00FF00'],
    }));

    act(() => {
      result.current.actions.updateColor(0, '#FFFF00');
    });

    expect(result.current.state.colors[0]).toBe('#FFFF00');
    expect(result.current.state.colors[1]).toBe('#00FF00');
  });

  it('should toggle style', () => {
    const { result } = renderHook(() => useBrandForm({
      selectedStyles: ['minimal'],
    }));

    act(() => {
      result.current.actions.toggleStyle('neon');
    });

    expect(result.current.state.selectedStyles).toContain('neon');
    expect(result.current.state.selectedStyles).toContain('minimal');

    act(() => {
      result.current.actions.toggleStyle('minimal');
    });

    expect(result.current.state.selectedStyles).not.toContain('minimal');
    expect(result.current.state.selectedStyles).toContain('neon');
  });

  it('should validate identity step', () => {
    const { result } = renderHook(() => useBrandForm());

    expect(result.current.validation.isIdentityValid).toBe(false);

    act(() => {
      result.current.actions.setName('Test Brand');
      // Mock file
      const file = new File([''], 'test.png', { type: 'image/png' });
      result.current.actions.setLogoFile(file);
    });

    expect(result.current.validation.isIdentityValid).toBe(true);
  });

  it('should validate aesthetics step', () => {
    const { result } = renderHook(() => useBrandForm());

    expect(result.current.validation.isAestheticsValid).toBe(false);

    act(() => {
      result.current.actions.toggleStyle('minimal');
    });

    expect(result.current.validation.isAestheticsValid).toBe(true);
  });

  it('should validate configuration step', () => {
    const { result } = renderHook(() => useBrandForm());

    expect(result.current.validation.isConfigurationValid).toBe(false);

    act(() => {
      result.current.actions.setApiKey('sk-test');
    });

    expect(result.current.validation.isConfigurationValid).toBe(true);

    act(() => {
      result.current.actions.setApiKey('');
      result.current.actions.setDemoMode(true);
    });

    expect(result.current.validation.isConfigurationValid).toBe(true);
  });

  it('should check if can proceed to next step', () => {
    const { result } = renderHook(() => useBrandForm());

    expect(result.current.validation.canProceedToNextStep('IDENTITY')).toBe(false);

    act(() => {
      result.current.actions.setName('Test');
      const file = new File([''], 'test.png', { type: 'image/png' });
      result.current.actions.setLogoFile(file);
    });

    expect(result.current.validation.canProceedToNextStep('IDENTITY')).toBe(true);
  });
});
