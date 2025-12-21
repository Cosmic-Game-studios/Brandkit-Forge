/**
 * Create Page Component
 * 
 * Main component for creating a brandkit with a multi-step wizard.
 * Handles form state, file uploads, and job submission.
 * 
 * @component
 * @example
 * ```tsx
 * <Create />
 * ```
 */

import { useCallback, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DEFAULT_PRESET_BACKGROUND_CHIPS,
  DEFAULT_PRESET_EDIT_CHIPS,
  DEFAULT_STYLE_CHIPS,
  DEFAULT_STYLES,
} from '../lib/createConstants';
import { estimateCost } from '../lib/costEstimate';
import { formatStyleChipsToPrompt, formatMoodChipsToPrompt } from '../lib/promptPreview';
import type {
  BackgroundSize,
  CustomPresetMap,
  CustomStyleMap,
  ImageFormat,
  ImageQuality,
} from '../types';
import { AestheticsStep } from './create/components/AestheticsStep';
import { ConfigurationStep } from './create/components/ConfigurationStep';
import { CustomPresetModal } from './create/components/CustomPresetModal';
import { CustomStyleModal } from './create/components/CustomStyleModal';
import { IdentityStep } from './create/components/IdentityStep';
import { PreviewSidebar } from './create/components/PreviewSidebar';
import { ProgressPanel } from './create/components/ProgressPanel';
import { Stepper } from './create/components/Stepper';
import type {
  CostInfo,
  DemoPromptEntry,
  EditingCustomPreset,
  EditingCustomStyle,
  StepId,
} from './create/types';

/**
 * Prompt parsing state for demo mode
 */
interface PromptParsingState {
  currentPrompt: { type: string; style: string; prompt: string } | null;
  promptLines: string[];
}

export default function Create() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<StepId>('IDENTITY');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(Array.from(DEFAULT_STYLES));
  const [customStyles, setCustomStyles] = useState<CustomStyleMap>({});
  const [showCustomStyleModal, setShowCustomStyleModal] = useState(false);
  const [editingCustomStyle, setEditingCustomStyle] = useState<EditingCustomStyle | null>(null);
  const [preset, setPreset] = useState<string>('core');
  const [customPresets, setCustomPresets] = useState<CustomPresetMap>({});
  const [showCustomPresetModal, setShowCustomPresetModal] = useState(false);
  const [editingCustomPreset, setEditingCustomPreset] = useState<EditingCustomPreset | null>(null);

  // Prompt parsing state ref for demo mode (persists across renders)
  const promptParsingRef = useRef<PromptParsingState>({
    currentPrompt: null,
    promptLines: [],
  });

  /**
   * Updates the editing custom style state
   * 
   * @param updater - Function that receives current state and returns new state
   */
  const updateEditingCustomStyle = useCallback((
    updater: (current: EditingCustomStyle) => EditingCustomStyle
  ) => {
    setEditingCustomStyle((current) => current ? updater(current) : null);
  }, []);

  /**
   * Updates the editing custom preset state
   * 
   * @param updater - Function that receives current state and returns new state
   */
  const updateEditingCustomPreset = useCallback((
    updater: (current: EditingCustomPreset) => EditingCustomPreset
  ) => {
    setEditingCustomPreset((current) => current ? updater(current) : null);
  }, []);
  
  /**
   * Adds a new color to the color palette
   */
  const addColor = useCallback(() => {
    setColors((prev) => [...prev, '#6D28D9']);
  }, []);
  
  /**
   * Removes a color from the color palette
   * 
   * @param index - Index of the color to remove
   */
  const removeColor = useCallback((index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  }, []);
  
  /**
   * Updates a color in the color palette
   * 
   * @param index - Index of the color to update
   * @param value - New color value (hex string)
   */
  const updateColor = useCallback((index: number, value: string) => {
    setColors((prev) => {
      const newColors = [...prev];
      if (index >= 0 && index < newColors.length) {
        newColors[index] = value;
      }
      return newColors;
    });
  }, []);

  const [format, setFormat] = useState<ImageFormat>('png');
  const [backgroundSize, setBackgroundSize] = useState<BackgroundSize>('landscape');
  const [transparency, setTransparency] = useState(false);
  const [compression] = useState(85);
  
  /**
   * Toggles a style in the selected styles list
   * 
   * @param style - Style name to toggle
   */
  const toggleStyle = useCallback((style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style)
        ? prev.filter((s) => s !== style)
        : [...prev, style]
    );
  }, []);
  
  /**
   * Opens the custom style modal for creating a new style
   */
  const addCustomStyle = useCallback(() => {
    setEditingCustomStyle({
      name: '',
      chips: Array.from(DEFAULT_STYLE_CHIPS),
      chipOrder: Array.from(DEFAULT_STYLE_CHIPS),
    });
    setShowCustomStyleModal(true);
  }, []);

  /**
   * Toggles a chip in the editing custom style
   * 
   * @param chip - Chip name to toggle
   */
  const toggleStyleChip = useCallback((chip: string) => {
    updateEditingCustomStyle((current) => {
      const updated = current.chips.includes(chip)
        ? current.chips.filter((entry) => entry !== chip)
        : [...current.chips, chip];
      return { ...current, chips: updated, chipOrder: updated };
    });
  }, [updateEditingCustomStyle]);

  /**
   * Clears all chips from the editing custom style
   */
  const clearStyleChips = useCallback(() => {
    updateEditingCustomStyle((current) => ({ ...current, chips: [], chipOrder: [] }));
  }, [updateEditingCustomStyle]);

  /**
   * Resets chips to default in the editing custom style
   */
  const resetStyleChips = useCallback(() => {
    updateEditingCustomStyle((current) => ({
      ...current,
      chips: Array.from(DEFAULT_STYLE_CHIPS),
      chipOrder: Array.from(DEFAULT_STYLE_CHIPS),
    }));
  }, [updateEditingCustomStyle]);

  /**
   * Saves the current editing custom style
   */
  const saveCustomStyle = useCallback(() => {
    if (editingCustomStyle && editingCustomStyle.name.trim() && editingCustomStyle.chips.length > 0) {
      const newCustomStyles = { ...customStyles };
      // Convert chips to formatted prompt string (backward compatible with simple format)
      const formattedPrompt = formatStyleChipsToPrompt(editingCustomStyle.chips);
      newCustomStyles[editingCustomStyle.name.trim()] = formattedPrompt;
      setCustomStyles(newCustomStyles);

      // Add to selected styles if not already selected
      setSelectedStyles((prev) => {
        if (!prev.includes(editingCustomStyle.name.trim())) {
          return [...prev, editingCustomStyle.name.trim()];
        }
        return prev;
      });

      setShowCustomStyleModal(false);
      setEditingCustomStyle(null);
    }
  }, [editingCustomStyle, customStyles]);

  /**
   * Reorders chips in the editing custom style
   * 
   * @param newOrder - New order of chips
   */
  const reorderStyleChips = useCallback((newOrder: string[]) => {
    updateEditingCustomStyle((current) => ({
      ...current,
      chips: newOrder,
      chipOrder: newOrder,
    }));
  }, [updateEditingCustomStyle]);

  /**
   * Parses a stored style string back into chips array
   * Supports both simple comma-separated and formatted formats
   * 
   * @param storedValue - Stored style string
   * @returns Array of chip names
   */
  const parseStyleStringToChips = useCallback((storedValue: string): string[] => {
    // Try to parse formatted string (contains "Category: chip1, chip2")
    if (storedValue.includes(':')) {
      const allChips: string[] = [];
      const parts = storedValue.split('. ');
      for (const part of parts) {
        if (part.includes(':')) {
          const [, chipList] = part.split(':');
          const chipArray = chipList.split(',').map(s => s.trim()).filter(Boolean);
          allChips.push(...chipArray);
        } else {
          // Uncategorized chips
          const chipArray = part.split(',').map(s => s.trim()).filter(Boolean);
          allChips.push(...chipArray);
        }
      }
      return allChips;
    }
    // Simple comma-separated format
    return storedValue.split(',').map(s => s.trim()).filter(Boolean);
  }, []);

  /**
   * Opens the custom style modal for editing an existing style
   * 
   * @param styleName - Name of the style to edit
   */
  const editCustomStyle = useCallback((styleName: string) => {
    const storedValue = customStyles[styleName];
    if (!storedValue) return;
    
    const chips = parseStyleStringToChips(storedValue);
    setEditingCustomStyle({ name: styleName, chips, chipOrder: chips });
    setShowCustomStyleModal(true);
  }, [customStyles, parseStyleStringToChips]);
  
  /**
   * Deletes a custom style
   * 
   * @param styleName - Name of the style to delete
   */
  const deleteCustomStyle = useCallback((styleName: string) => {
    setCustomStyles((prev) => {
      const newCustomStyles = { ...prev };
      delete newCustomStyles[styleName];
      return newCustomStyles;
    });
    setSelectedStyles((prev) => prev.filter(s => s !== styleName));
  }, []);

  /**
   * Opens the custom preset modal for creating a new preset
   */
  const addCustomPreset = useCallback(() => {
    setEditingCustomPreset({
      id: '',
      name: '',
      description: '',
      backgroundChips: Array.from(DEFAULT_PRESET_BACKGROUND_CHIPS),
      editChips: Array.from(DEFAULT_PRESET_EDIT_CHIPS),
      backgroundChipOrder: Array.from(DEFAULT_PRESET_BACKGROUND_CHIPS),
      editChipOrder: Array.from(DEFAULT_PRESET_EDIT_CHIPS),
    });
    setShowCustomPresetModal(true);
  }, []);

  /**
   * Toggles a chip in the editing custom preset
   * 
   * @param chipType - Type of chip ('background' or 'edit')
   * @param chip - Chip name to toggle
   */
  const togglePresetChip = useCallback((chipType: 'background' | 'edit', chip: string) => {
    updateEditingCustomPreset((current) => {
      const key = chipType === 'background' ? 'backgroundChips' : 'editChips';
      const orderKey = chipType === 'background' ? 'backgroundChipOrder' : 'editChipOrder';
      const selected = current[key];
      const updated = selected.includes(chip)
        ? selected.filter((entry) => entry !== chip)
        : [...selected, chip];
      return { ...current, [key]: updated, [orderKey]: updated };
    });
  }, [updateEditingCustomPreset]);

  /**
   * Saves the current editing custom preset
   */
  const saveCustomPreset = useCallback(() => {
    if (editingCustomPreset && editingCustomPreset.name.trim() && editingCustomPreset.backgroundChips.length > 0 && editingCustomPreset.editChips.length > 0) {
      const presetId = editingCustomPreset.id || editingCustomPreset.name.toLowerCase().replace(/\s+/g, '-');
      const newCustomPresets = { ...customPresets };
      // Convert chips to formatted prompt strings
      const background = formatMoodChipsToPrompt(editingCustomPreset.backgroundChips);
      const edit = formatMoodChipsToPrompt(editingCustomPreset.editChips);
      const description = editingCustomPreset.description || `${editingCustomPreset.backgroundChips.slice(0, 3).join(', ')} look`;
      newCustomPresets[presetId] = { description, background, edit };
      setCustomPresets(newCustomPresets);

      // Select the new preset
      setPreset(presetId);

      setShowCustomPresetModal(false);
      setEditingCustomPreset(null);
    }
  }, [editingCustomPreset, customPresets]);

  /**
   * Reorders chips in the editing custom preset
   * 
   * @param chipType - Type of chip ('background' or 'edit')
   * @param newOrder - New order of chips
   */
  const reorderPresetChips = useCallback((chipType: 'background' | 'edit', newOrder: string[]) => {
    updateEditingCustomPreset((current) => {
      if (chipType === 'background') {
        return {
          ...current,
          backgroundChips: newOrder,
          backgroundChipOrder: newOrder,
        };
      } else {
        return {
          ...current,
          editChips: newOrder,
          editChipOrder: newOrder,
        };
      }
    });
  }, [updateEditingCustomPreset]);

  /**
   * Parses a stored preset string back into chips arrays
   * Supports both simple comma-separated and formatted formats
   * 
   * @param storedValue - Stored preset string (background or edit)
   * @returns Array of chip names
   */
  const parsePresetStringToChips = useCallback((storedValue: string): string[] => {
    // Try to parse formatted string (contains "Category: chip1, chip2")
    if (storedValue.includes(':')) {
      const allChips: string[] = [];
      const parts = storedValue.split('. ');
      for (const part of parts) {
        if (part.includes(':')) {
          const [, chipList] = part.split(':');
          const chipArray = chipList.split(',').map(s => s.trim()).filter(Boolean);
          allChips.push(...chipArray);
        } else {
          // Uncategorized chips
          const chipArray = part.split(',').map(s => s.trim()).filter(Boolean);
          allChips.push(...chipArray);
        }
      }
      return allChips;
    }
    // Simple comma-separated format
    return storedValue.split(',').map(s => s.trim()).filter(Boolean);
  }, []);

  /**
   * Opens the custom preset modal for editing an existing preset
   * 
   * @param presetId - ID of the preset to edit
   */
  const editCustomPreset = useCallback((presetId: string) => {
    const preset = customPresets[presetId];
    if (!preset) return;
    
    const backgroundChips = parsePresetStringToChips(preset.background);
    const editChips = parsePresetStringToChips(preset.edit);
    
    // Extract name from presetId (convert kebab-case back to readable name)
    const name = presetId.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    setEditingCustomPreset({
      id: presetId,
      name,
      description: preset.description,
      backgroundChips,
      editChips,
      backgroundChipOrder: backgroundChips,
      editChipOrder: editChips,
    });
    setShowCustomPresetModal(true);
  }, [customPresets, parsePresetStringToChips]);
  
  /**
   * Deletes a custom preset
   * 
   * @param presetId - ID of the preset to delete
   */
  const deleteCustomPreset = useCallback((presetId: string) => {
    setCustomPresets((prev) => {
      const newCustomPresets = { ...prev };
      delete newCustomPresets[presetId];
      return newCustomPresets;
    });
    // If the deleted preset was selected, reset to default
    if (preset === presetId) {
      setPreset('core');
    }
  }, [preset]);

  const [quality, setQuality] = useState<ImageQuality>('high');
  const [n, setN] = useState('2');
  const [cache] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cost, setCost] = useState<CostInfo | null>(null);
  const [generatedPrompts, setGeneratedPrompts] = useState<DemoPromptEntry[]>([]);

  /**
   * Navigates to the next step in the wizard
   */
  const nextStep = useCallback(() => {
    setCurrentStep((current) => {
      if (current === 'IDENTITY') return 'AESTHETICS';
      if (current === 'AESTHETICS') return 'CONFIGURATION';
      return current;
    });
  }, []);

  /**
   * Navigates to the previous step in the wizard
   */
  const prevStep = useCallback(() => {
    setCurrentStep((current) => {
      if (current === 'AESTHETICS') return 'IDENTITY';
      if (current === 'CONFIGURATION') return 'AESTHETICS';
      return current;
    });
  }, []);

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  /**
   * Copies a prompt to clipboard
   * 
   * @param prompt - Prompt text to copy
   * @param index - Index of the prompt in the list
   */
  const copyPrompt = useCallback(async (prompt: string, index: number) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  /**
   * Handles file selection and creates preview
   * 
   * @param file - Selected file
   */
  const handleFileSelect = useCallback((file: File) => {
    if (file.type.startsWith('image/')) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setLogoPreview(result);
        }
      };
      reader.readAsDataURL(file);
      setError(null);
    } else {
      setError('Please choose an image file (PNG, JPG, WebP)');
    }
  }, []);

  /**
   * Parses a prompt message in demo mode
   * 
   * @param msg - Message to parse
   * @param trimmedMsg - Trimmed version of the message
   * @returns True if prompt was saved
   */
  const parsePromptMessage = useCallback((msg: string, trimmedMsg: string): boolean => {
    const state = promptParsingRef.current;
    
    // Check for prompt marker
    const promptMatch = trimmedMsg.match(/^\[PROMPT:(BACKGROUND|HERO):([^:]+):(\d+)\]$/);
    
    if (promptMatch) {
      // Save previous prompt if exists
      if (state.currentPrompt && state.promptLines.length > 0) {
        const finishedPrompt: DemoPromptEntry = {
          type: state.currentPrompt.type,
          style: state.currentPrompt.style,
          prompt: state.promptLines.join('\n').trim()
        };
        setGeneratedPrompts((prev) => [...prev, finishedPrompt]);
      }
      // Start new prompt
      state.currentPrompt = {
        type: promptMatch[1].toLowerCase(),
        style: promptMatch[2],
        prompt: ''
      };
      state.promptLines = [];
      return false;
    }
    
    if (trimmedMsg === '---') {
      // End of prompt block
      if (state.currentPrompt && state.promptLines.length > 0) {
        const finishedPrompt: DemoPromptEntry = {
          type: state.currentPrompt.type,
          style: state.currentPrompt.style,
          prompt: state.promptLines.join('\n').trim()
        };
        setGeneratedPrompts((prev) => [...prev, finishedPrompt]);
        state.currentPrompt = null;
        state.promptLines = [];
        return true;
      }
      return false;
    }
    
    if (state.currentPrompt) {
      // Check if this is a header/info line that should be skipped
      const isHeaderLine = 
        trimmedMsg.startsWith('Demo Mode:') ||
        trimmedMsg.startsWith('Brand:') ||
        trimmedMsg.startsWith('Tagline:') ||
        trimmedMsg.startsWith('Styles:') ||
        trimmedMsg.startsWith('Variants per style:') ||
        trimmedMsg.startsWith('Copy these') ||
        trimmedMsg.startsWith('After generating') ||
        trimmedMsg.startsWith('Demo complete') ||
        trimmedMsg.startsWith('Tip:') ||
        /^\[PROMPT:/.test(trimmedMsg);
      
      // Accumulate prompt content (include empty lines as they are part of the prompt)
      if (!isHeaderLine) {
        state.promptLines.push(msg);
      }
    }
    
    return false;
  }, []);

  /**
   * Saves any remaining prompt from parsing state
   */
  const saveRemainingPrompt = useCallback(() => {
    const state = promptParsingRef.current;
    if (state.currentPrompt && state.promptLines.length > 0) {
      const finishedPrompt: DemoPromptEntry = {
        type: state.currentPrompt.type,
        style: state.currentPrompt.style,
        prompt: state.promptLines.join('\n').trim()
      };
      setGeneratedPrompts((prev) => [...prev, finishedPrompt]);
      state.currentPrompt = null;
      state.promptLines = [];
    }
  }, []);

  // Memoized computed values (must be defined before handleSubmit)
  const stylesValue = useMemo(() => selectedStyles.join(','), [selectedStyles]);

  /**
   * Handles form submission and job creation
   * 
   * @param e - Form event
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoFile || !name.trim()) {
      setError('Logo and name are required');
      return;
    }

    setIsGenerating(true);
    setProgress([]);
    setError(null);
    setCost(null);
    setGeneratedPrompts([]);
    setCopiedIndex(null);
    
    // Reset prompt parsing state
    promptParsingRef.current = {
      currentPrompt: null,
      promptLines: [],
    };

    try {
      const formData = new FormData();
      // IMPORTANT: config must come BEFORE file for @fastify/multipart
      formData.append(
        'config',
        JSON.stringify({
          name,
          tagline: tagline || undefined,
          colors: colors.length > 0 ? colors.join(',') : undefined,
          styles: stylesValue || undefined,
          customStyles: Object.keys(customStyles).length > 0 ? customStyles : undefined,
          customPresets: Object.keys(customPresets).length > 0 ? customPresets : undefined,
          preset: preset || undefined,
          format,
          quality,
          n,
          cache,
          apiKey: apiKey.trim() || undefined,
          demoMode,
          backgroundSize,
          transparency: format === 'png' ? transparency : undefined,
          compression: format === 'jpeg' ? compression : undefined,
        })
      );
      formData.append('file', logoFile);

      const response = await fetch('/api/jobs', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create job');
      }

      const { jobId } = await response.json() as { jobId: string };

      // SSE for progress and cost updates
      const eventSource = new EventSource(`/api/jobs/${jobId}/events`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as { cost?: CostInfo; message?: string; status?: 'completed' | 'error' };
          
          if (data.cost) {
            setCost(data.cost);
          }
          
          if (data.message) {
            const msg = data.message;
            const trimmedMsg = msg.trim();

            // Parse prompt markers in demo mode
            if (demoMode) {
              parsePromptMessage(msg, trimmedMsg);
            }

            setProgress((prev) => [...prev, msg]);
          }
          
          if (data.status === 'completed') {
            // Save any remaining prompt before closing
            if (demoMode) {
              saveRemainingPrompt();
            }
            eventSource.close();
            setIsGenerating(false);
            // In demo mode, stay on page to show prompts
            if (!demoMode) {
              navigate(`/results/${jobId}`);
            }
          } else if (data.status === 'error') {
            // Save any remaining prompt before closing
            if (demoMode) {
              saveRemainingPrompt();
            }
            eventSource.close();
            setIsGenerating(false);
            setError('Generation failed');
          }
        } catch (parseError) {
          console.error('Failed to parse SSE message:', parseError);
        }
      };

      eventSource.onerror = () => {
        // Save any remaining prompt before closing
        if (demoMode) {
          saveRemainingPrompt();
        }
        eventSource.close();
        setIsGenerating(false);
        setError('Connection error');
      };
    } catch (err) {
      setIsGenerating(false);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [
    logoFile,
    name,
    tagline,
    colors,
    stylesValue,
    customStyles,
    customPresets,
    preset,
    format,
    quality,
    n,
    cache,
    apiKey,
    demoMode,
    backgroundSize,
    transparency,
    compression,
    demoMode,
    parsePromptMessage,
    saveRemainingPrompt,
    navigate,
    stylesValue,
  ]);

  const estimatedCost = useMemo(() => {
    const variants = Number.parseInt(n, 10) || 1;
    return estimateCost(quality, backgroundSize, selectedStyles.length, variants);
  }, [backgroundSize, n, quality, selectedStyles.length]);

  // Memoized modal close handlers
  const closeCustomStyleModal = useCallback(() => {
    setShowCustomStyleModal(false);
    setEditingCustomStyle(null);
  }, []);

  const closeCustomPresetModal = useCallback(() => {
    setShowCustomPresetModal(false);
    setEditingCustomPreset(null);
  }, []);

  // Memoized modal change handlers
  const handleCustomStyleNameChange = useCallback((newName: string) => {
    setEditingCustomStyle((prev) => prev ? { ...prev, name: newName } : null);
  }, []);

  const handleCustomPresetNameChange = useCallback((newName: string) => {
    setEditingCustomPreset((prev) => prev ? { ...prev, name: newName } : null);
  }, []);

  const handleCustomPresetDescriptionChange = useCallback((newDescription: string) => {
    setEditingCustomPreset((prev) => prev ? { ...prev, description: newDescription } : null);
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Stepper currentStep={currentStep} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-gray-200/50 border-2 border-white/20">
            {currentStep === 'IDENTITY' && (
              <IdentityStep
                logoPreview={logoPreview}
                logoFile={logoFile}
                name={name}
                tagline={tagline}
                onChangeName={setName}
                onChangeTagline={setTagline}
                onFileSelect={handleFileSelect}
                onNext={nextStep}
              />
            )}

            {currentStep === 'AESTHETICS' && (
              <AestheticsStep
                selectedStyles={selectedStyles}
                customStyles={customStyles}
                onToggleStyle={toggleStyle}
                onAddCustomStyle={addCustomStyle}
                onEditCustomStyle={editCustomStyle}
                onDeleteCustomStyle={deleteCustomStyle}
                colors={colors}
                onAddColor={addColor}
                onRemoveColor={removeColor}
                onUpdateColor={updateColor}
                preset={preset}
                customPresets={customPresets}
                onSetPreset={setPreset}
                onAddCustomPreset={addCustomPreset}
                onEditCustomPreset={editCustomPreset}
                onDeleteCustomPreset={deleteCustomPreset}
                onPrev={prevStep}
                onNext={nextStep}
              />
            )}

            {currentStep === 'CONFIGURATION' && (
              <ConfigurationStep
                quality={quality}
                onSetQuality={setQuality}
                format={format}
                onSetFormat={setFormat}
                transparency={transparency}
                onSetTransparency={setTransparency}
                backgroundSize={backgroundSize}
                onSetBackgroundSize={setBackgroundSize}
                n={n}
                onSetN={setN}
                apiKey={apiKey}
                onSetApiKey={setApiKey}
                demoMode={demoMode}
                onSetDemoMode={setDemoMode}
                isGenerating={isGenerating}
                onPrev={prevStep}
              />
            )}
          </form>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl shadow-red-200/50 border-2 border-red-100/50 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-red-800 font-semibold mb-1">Error</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all"
                  aria-label="Dismiss error"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <ProgressPanel
            isGenerating={isGenerating}
            demoMode={demoMode}
            progress={progress}
            cost={cost}
            generatedPrompts={generatedPrompts}
            copiedIndex={copiedIndex}
            onCopyPrompt={copyPrompt}
          />
        </div>

        <PreviewSidebar
          logoPreview={logoPreview}
          name={name}
          tagline={tagline}
          selectedStyles={selectedStyles}
          colors={colors}
          format={format}
          quality={quality}
          backgroundSize={backgroundSize}
          n={n}
          estimatedCost={estimatedCost}
        />
      </div>

      {showCustomStyleModal && editingCustomStyle && (
        <CustomStyleModal
          editing={editingCustomStyle}
          onChangeName={handleCustomStyleNameChange}
          onToggleChip={toggleStyleChip}
          onResetChips={resetStyleChips}
          onClearChips={clearStyleChips}
          onSave={saveCustomStyle}
          onReorderChips={reorderStyleChips}
          onClose={closeCustomStyleModal}
        />
      )}

      {showCustomPresetModal && editingCustomPreset && (
        <CustomPresetModal
          editing={editingCustomPreset}
          onChangeName={handleCustomPresetNameChange}
          onChangeDescription={handleCustomPresetDescriptionChange}
          onToggleChip={togglePresetChip}
          onReorderChips={reorderPresetChips}
          onSave={saveCustomPreset}
          onClose={closeCustomPresetModal}
        />
      )}
    </div>
  );
}
