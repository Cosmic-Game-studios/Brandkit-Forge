/**
 * Custom hook for managing brand form state
 * 
 * Provides type-safe state management and validation for the brand creation form.
 * Handles all form fields including identity, aesthetics, and configuration.
 * 
 * @module useBrandForm
 * 
 * @example
 * ```tsx
 * const { state, actions, validation } = useBrandForm();
 * 
 * // Update form values
 * actions.setName('My Brand');
 * actions.addColor();
 * 
 * // Check validation
 * if (validation.isIdentityValid) {
 *   // Proceed to next step
 * }
 * ```
 */

import { useCallback, useMemo, useState } from 'react';
import type {
  BackgroundSize,
  CustomPresetMap,
  CustomStyleMap,
  ImageFormat,
  ImageQuality,
} from '../../../types';
import type { StepId } from '../types';

export interface BrandFormState {
  // Identity
  logoFile: File | null;
  logoPreview: string | null;
  name: string;
  tagline: string;
  
  // Aesthetics
  colors: string[];
  selectedStyles: string[];
  customStyles: CustomStyleMap;
  preset: string;
  customPresets: CustomPresetMap;
  
  // Configuration
  format: ImageFormat;
  quality: ImageQuality;
  backgroundSize: BackgroundSize;
  transparency: boolean;
  n: string;
  apiKey: string;
  demoMode: boolean;
}

export interface BrandFormActions {
  // Identity
  setLogoFile: (file: File | null) => void;
  setLogoPreview: (preview: string | null) => void;
  setName: (name: string) => void;
  setTagline: (tagline: string) => void;
  
  // Aesthetics
  addColor: () => void;
  removeColor: (index: number) => void;
  updateColor: (index: number, value: string) => void;
  toggleStyle: (style: string) => void;
  setPreset: (preset: string) => void;
  
  // Configuration
  setFormat: (format: ImageFormat) => void;
  setQuality: (quality: ImageQuality) => void;
  setBackgroundSize: (size: BackgroundSize) => void;
  setTransparency: (transparency: boolean) => void;
  setN: (n: string) => void;
  setApiKey: (apiKey: string) => void;
  setDemoMode: (demoMode: boolean) => void;
}

export interface BrandFormValidation {
  isIdentityValid: boolean;
  isAestheticsValid: boolean;
  isConfigurationValid: boolean;
  canProceedToNextStep: (step: StepId) => boolean;
}

const DEFAULT_COLOR = '#6D28D9';
const MIN_COLORS = 0;
const MAX_COLORS = 10;

/**
 * Custom hook for managing brand form state with validation
 */
export function useBrandForm(initialState?: Partial<BrandFormState>) {
  // Identity
  const [logoFile, setLogoFile] = useState<File | null>(initialState?.logoFile ?? null);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialState?.logoPreview ?? null);
  const [name, setName] = useState<string>(initialState?.name ?? '');
  const [tagline, setTagline] = useState<string>(initialState?.tagline ?? '');
  
  // Aesthetics
  const [colors, setColors] = useState<string[]>(initialState?.colors ?? []);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(initialState?.selectedStyles ?? []);
  const [customStyles, setCustomStyles] = useState<CustomStyleMap>(initialState?.customStyles ?? {});
  const [preset, setPreset] = useState<string>(initialState?.preset ?? 'core');
  const [customPresets, setCustomPresets] = useState<CustomPresetMap>(initialState?.customPresets ?? {});
  
  // Configuration
  const [format, setFormat] = useState<ImageFormat>(initialState?.format ?? 'png');
  const [quality, setQuality] = useState<ImageQuality>(initialState?.quality ?? 'high');
  const [backgroundSize, setBackgroundSize] = useState<BackgroundSize>(initialState?.backgroundSize ?? 'landscape');
  const [transparency, setTransparency] = useState<boolean>(initialState?.transparency ?? false);
  const [n, setN] = useState<string>(initialState?.n ?? '2');
  const [apiKey, setApiKey] = useState<string>(initialState?.apiKey ?? '');
  const [demoMode, setDemoMode] = useState<boolean>(initialState?.demoMode ?? false);

  // Color management
  const addColor = useCallback(() => {
    if (colors.length < MAX_COLORS) {
      setColors((prev) => [...prev, DEFAULT_COLOR]);
    }
  }, [colors.length]);

  const removeColor = useCallback((index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateColor = useCallback((index: number, value: string) => {
    setColors((prev) => {
      const newColors = [...prev];
      if (index >= 0 && index < newColors.length) {
        newColors[index] = value;
      }
      return newColors;
    });
  }, []);

  // Style management
  const toggleStyle = useCallback((style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style)
        ? prev.filter((s) => s !== style)
        : [...prev, style]
    );
  }, []);

  // Validation
  const validation = useMemo<BrandFormValidation>(() => {
    const isIdentityValid = Boolean(logoFile && name.trim().length > 0);
    const isAestheticsValid = selectedStyles.length > 0;
    const isConfigurationValid = demoMode || apiKey.trim().length > 0;

    const canProceedToNextStep = (step: StepId): boolean => {
      switch (step) {
        case 'IDENTITY':
          return isIdentityValid;
        case 'AESTHETICS':
          return isAestheticsValid;
        case 'CONFIGURATION':
          return isConfigurationValid;
        default:
          return false;
      }
    };

    return {
      isIdentityValid,
      isAestheticsValid,
      isConfigurationValid,
      canProceedToNextStep,
    };
  }, [logoFile, name, selectedStyles.length, demoMode, apiKey]);

  const state: BrandFormState = useMemo(
    () => ({
      logoFile,
      logoPreview,
      name,
      tagline,
      colors,
      selectedStyles,
      customStyles,
      preset,
      customPresets,
      format,
      quality,
      backgroundSize,
      transparency,
      n,
      apiKey,
      demoMode,
    }),
    [
      logoFile,
      logoPreview,
      name,
      tagline,
      colors,
      selectedStyles,
      customStyles,
      preset,
      customPresets,
      format,
      quality,
      backgroundSize,
      transparency,
      n,
      apiKey,
      demoMode,
    ]
  );

  const actions: BrandFormActions = useMemo(
    () => ({
      setLogoFile,
      setLogoPreview,
      setName,
      setTagline,
      addColor,
      removeColor,
      updateColor,
      toggleStyle,
      setPreset,
      setFormat,
      setQuality,
      setBackgroundSize,
      setTransparency,
      setN,
      setApiKey,
      setDemoMode,
    }),
    [addColor, removeColor, updateColor, toggleStyle]
  );

  return {
    state,
    actions,
    validation,
    setCustomStyles,
    setCustomPresets,
  } as const;
}
