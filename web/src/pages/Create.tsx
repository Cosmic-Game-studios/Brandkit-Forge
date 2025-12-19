import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Create.css';

const PRESET_OPTIONS = [
  {
    id: 'core',
    name: 'Core',
    description: 'Ultra-premium, cinematic, hero-grade polish.',
  },
  {
    id: 'soft',
    name: 'Soft Airy',
    description: 'Luminous luxury with dreamy softness.',
  },
  {
    id: 'bold',
    name: 'Bold Contrast',
    description: 'Maximum contrast with bold energy and punch.',
  },
  {
    id: 'noir',
    name: 'Noir',
    description: 'Dark, sleek, cinematic intensity with sharp highlights.',
  },
] as const;

export default function Create() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['minimal', 'neon', 'clay', 'blueprint']);
  const [customStyles, setCustomStyles] = useState<Record<string, string>>({});
  const [showCustomStyleModal, setShowCustomStyleModal] = useState(false);
  const [editingCustomStyle, setEditingCustomStyle] = useState<{ name: string; prompt: string } | null>(null);
  const [preset, setPreset] = useState<string>('core');
  
  const addColor = () => {
    setColors([...colors, '#6D28D9']);
  };
  
  const removeColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
  };
  
  const updateColor = (index: number, value: string) => {
    const newColors = [...colors];
    newColors[index] = value;
    setColors(newColors);
  };
  const [format, setFormat] = useState('png');
  const [backgroundSize, setBackgroundSize] = useState<'landscape' | 'square' | 'portrait'>('landscape');
  const [transparency, setTransparency] = useState(false);
  const [compression, setCompression] = useState(85);

  const availableStyles = ['minimal', 'neon', 'clay', 'blueprint'];
  
  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style)
        ? prev.filter((s) => s !== style)
        : [...prev, style]
    );
  };
  
  const addCustomStyle = () => {
    setEditingCustomStyle({
      name: '',
      prompt:
        'ultra minimal, large clean planes, razor-smooth gradients, architectural lighting, museum-grade, abstract',
    });
    setShowCustomStyleModal(true);
  };
  
  const saveCustomStyle = () => {
    if (editingCustomStyle && editingCustomStyle.name.trim()) {
      const newCustomStyles = { ...customStyles };
      newCustomStyles[editingCustomStyle.name.trim()] = editingCustomStyle.prompt;
      setCustomStyles(newCustomStyles);
      
      // Add to selected styles if not already selected
      if (!selectedStyles.includes(editingCustomStyle.name.trim())) {
        setSelectedStyles([...selectedStyles, editingCustomStyle.name.trim()]);
      }
      
      setShowCustomStyleModal(false);
      setEditingCustomStyle(null);
    }
  };
  
  const editCustomStyle = (styleName: string) => {
    setEditingCustomStyle({ name: styleName, prompt: customStyles[styleName] });
    setShowCustomStyleModal(true);
  };
  
  const deleteCustomStyle = (styleName: string) => {
    const newCustomStyles = { ...customStyles };
    delete newCustomStyles[styleName];
    setCustomStyles(newCustomStyles);
    setSelectedStyles(selectedStyles.filter(s => s !== styleName));
  };
  
  const allStyles = [...availableStyles, ...Object.keys(customStyles)];
  const [quality, setQuality] = useState('high');
  const [n, setN] = useState('2');
  const [cache, setCache] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cost, setCost] = useState<{
    totalCost: number;
    apiCalls: number;
    breakdown: { backgrounds: number; heroes: number };
  } | null>(null);
  const [generatedPrompts, setGeneratedPrompts] = useState<{ type: string; style: string; prompt: string }[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyPrompt = async (prompt: string, index: number) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('image/')) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    } else {
      setError('Please choose an image file (PNG, JPG, WebP)');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      const formData = new FormData();
      // IMPORTANT: config must come BEFORE file for @fastify/multipart
      formData.append(
        'config',
        JSON.stringify({
          name,
          tagline: tagline || undefined,
          colors: colors.length > 0 ? colors.join(',') : undefined,
          styles: styles || undefined,
          customStyles: Object.keys(customStyles).length > 0 ? customStyles : undefined,
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

      const { jobId } = await response.json();

      // SSE for progress and cost updates
      const eventSource = new EventSource(`/api/jobs/${jobId}/events`);
      let currentPrompt: { type: string; style: string; prompt: string } | null = null;
      let promptLines: string[] = [];

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.cost) {
          setCost(data.cost);
        }
        if (data.message) {
          const msg = data.message;

          // Parse prompt markers in demo mode
          if (demoMode) {
            const promptMatch = msg.match(/^\[PROMPT:(BACKGROUND|HERO):([^:]+):(\d+)\]$/);
            if (promptMatch) {
              // Save previous prompt if exists
              if (currentPrompt && promptLines.length > 0) {
                const finishedPrompt = {
                  type: currentPrompt.type,
                  style: currentPrompt.style,
                  prompt: promptLines.join('\n')
                };
                setGeneratedPrompts(prev => [...prev, finishedPrompt]);
              }
              // Start new prompt
              currentPrompt = {
                type: promptMatch[1].toLowerCase(),
                style: promptMatch[2],
                prompt: ''
              };
              promptLines = [];
            } else if (msg === '---') {
              // End of prompt block
              if (currentPrompt && promptLines.length > 0) {
                const finishedPrompt = {
                  type: currentPrompt.type,
                  style: currentPrompt.style,
                  prompt: promptLines.join('\n')
                };
                setGeneratedPrompts(prev => [...prev, finishedPrompt]);
                currentPrompt = null;
                promptLines = [];
              }
            } else if (currentPrompt) {
              // Accumulate prompt lines
              promptLines.push(msg);
            }
          }

          setProgress((prev) => [...prev, msg]);
        }
        if (data.status === 'completed') {
          eventSource.close();
          setIsGenerating(false);
          // In demo mode, stay on page to show prompts
          if (!demoMode) {
            navigate(`/results/${jobId}`);
          }
        } else if (data.status === 'error') {
          eventSource.close();
          setIsGenerating(false);
          setError('Generation failed');
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setIsGenerating(false);
        setError('Connection error');
      };
    } catch (err) {
      setIsGenerating(false);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const styles = selectedStyles.join(',');

  const styleTokens = selectedStyles.slice(0, 6);
  const selectedPreset = PRESET_OPTIONS.find((option) => option.id === preset);
  const presetLabel = selectedPreset ? selectedPreset.name : preset;

  // Calculate estimated cost based on selected options
  // GPT-image-1.5 pricing (December 2025)
  const estimatedCost = (() => {
    const variants = parseInt(n) || 1;
    const numStyles = selectedStyles.length;

    // Pricing per image based on quality (gpt-image-1.5)
    const pricing: Record<string, { landscape: number; square: number; portrait: number }> = {
      low: { landscape: 0.015, square: 0.01, portrait: 0.015 },
      medium: { landscape: 0.06, square: 0.04, portrait: 0.06 },
      high: { landscape: 0.25, square: 0.17, portrait: 0.25 },
      auto: { landscape: 0.25, square: 0.17, portrait: 0.25 }, // auto defaults to high
    };

    const prices = pricing[quality] || pricing.high;

    // Calculate API calls based on size selection
    // Square: 1 background + 1 square hero = 2 calls
    // Landscape/Portrait: 1 background + 1 primary hero + 1 square hero = 3 calls
    let costPerVariant: number;
    let apiCallsPerVariant: number;

    if (backgroundSize === 'square') {
      costPerVariant = prices.square + prices.square; // bg + square hero
      apiCallsPerVariant = 2;
    } else if (backgroundSize === 'portrait') {
      costPerVariant = prices.portrait + prices.portrait + prices.square; // bg + portrait hero + square hero
      apiCallsPerVariant = 3;
    } else {
      costPerVariant = prices.landscape + prices.landscape + prices.square; // bg + landscape hero + square hero
      apiCallsPerVariant = 3;
    }

    const totalCost = numStyles * variants * costPerVariant;
    const totalApiCalls = numStyles * variants * apiCallsPerVariant;

    return { totalCost, totalApiCalls, numStyles, variants };
  })();

  return (
    <div className="create-page">
      <section className="page-hero">
        <div className="page-hero-text">
          <p className="eyebrow">Brandkit Forge</p>
          <h1>Create a new brandkit</h1>
          <p className="hero-subtitle">
            One logo in. A complete brand asset pack out.
          </p>
          <div className="hero-badges">
            <span>Drag and drop</span>
            <span>Live progress</span>
            <span>ZIP export</span>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-card-title">Styles preview</div>
          <div className="hero-chip-grid">
            {styleTokens.length ? (
              styleTokens.map((style, index) => (
                <span key={`${style}-${index}`} className="chip">
                  {style}
                </span>
              ))
            ) : (
              <span className="chip chip-empty">add styles</span>
            )}
          </div>
          <div className="hero-card-note">
            {presetLabel} | {format.toUpperCase()} | {quality} | {backgroundSize} | {n} variants
          </div>
          {selectedStyles.length > 0 && (
            <div className="cost-estimate">
              <div className="cost-estimate-header">
                <span className="cost-estimate-label">Estimated cost:</span>
                <span className="cost-estimate-value">${estimatedCost.totalCost.toFixed(2)}</span>
                <div className="cost-info-wrapper">
                  <button type="button" className="cost-info-btn" aria-label="Cost information">?</button>
                  <div className="cost-tooltip cost-tooltip--left">
                    <p><strong>How costs are calculated:</strong></p>
                    <p>Based on OpenAI gpt-image-1.5 pricing:</p>
                    <ul>
                      <li><strong>Low:</strong> ~$0.04/style/variant</li>
                      <li><strong>Medium:</strong> ~$0.16/style/variant</li>
                      <li><strong>High:</strong> ~$0.67/style/variant</li>
                    </ul>
                    <p>Each style generates 1 background + 2 hero images per variant.</p>
                    <p className="cost-tooltip-note">Actual charges may vary based on OpenAI's pricing.</p>
                  </div>
                </div>
              </div>
              <div className="cost-estimate-details">
                {estimatedCost.numStyles} styles × {estimatedCost.variants} variants = {estimatedCost.totalApiCalls} API calls
              </div>
            </div>
          )}
        </div>
      </section>

      <form onSubmit={handleSubmit} className="create-form">
        <div className="form-grid">
          <div className="form-panel form-panel--upload">
            <div className="form-section">
              <label>Upload logo *</label>
              <div
                className={`drop-zone ${isDragging ? 'dragging' : ''} ${
                  logoPreview ? 'has-file' : ''
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Preview" />
                ) : (
                  <div className="drop-zone-content">
                    <img src="/Logo.png" alt="Example Logo" className="example-logo" />
                    <p>Drop your logo here or click to select</p>
                    <p className="drop-zone-hint">PNG, JPG or WebP</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </div>
          </div>

          <div className="form-panel form-panel--config">
            <div className="form-section">
              <label htmlFor="name">Brand name *</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Side Quest"
                required
              />
            </div>

            <div className="form-section">
              <label htmlFor="tagline">Tagline (optional)</label>
              <input
                id="tagline"
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Go outside. Level up."
              />
            </div>

            <div className="form-section">
              <label>Colors (optional)</label>
              <div className="colors-container">
                {colors.map((color, index) => (
                  <div key={index} className="color-input-group">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => updateColor(index, e.target.value)}
                      className="color-picker"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => updateColor(index, e.target.value)}
                      className="color-text"
                      placeholder="#RRGGBB"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                    <button
                      type="button"
                      onClick={() => removeColor(index)}
                      className="color-remove"
                      aria-label="Remove color"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addColor}
                  className="color-add-button"
                >
                  + Add Color
                </button>
              </div>
              {colors.length === 0 && (
                <p className="form-hint">
                  Add colors to customize the generated backgrounds
                </p>
              )}
            </div>

            <div className="form-section">
              <label>Styles *</label>
              <div className="styles-grid">
                {availableStyles.map((style) => (
                  <label key={style} className="style-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedStyles.includes(style)}
                      onChange={() => toggleStyle(style)}
                    />
                    <span className="style-label">{style}</span>
                  </label>
                ))}
                {Object.keys(customStyles).map((styleName) => (
                  <label key={styleName} className="style-checkbox style-checkbox--custom">
                    <input
                      type="checkbox"
                      checked={selectedStyles.includes(styleName)}
                      onChange={() => toggleStyle(styleName)}
                    />
                    <span className="style-label">{styleName}</span>
                    <div className="style-actions">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          editCustomStyle(styleName);
                        }}
                        className="style-edit-btn"
                        title="Edit style"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCustomStyle(styleName);
                        }}
                        className="style-delete-btn"
                        title="Delete style"
                      >
                        ×
                      </button>
                    </div>
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={addCustomStyle}
                className="add-custom-style-button"
              >
                + Create Custom Style
              </button>
              {selectedStyles.length === 0 && (
                <p className="form-hint" style={{ color: '#c33', marginTop: '0.5rem' }}>
                  Please select at least one style
                </p>
              )}
            </div>

            <div className="form-section">
              <label htmlFor="preset">Prompt preset</label>
              <select
                id="preset"
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
              >
                {PRESET_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              <p className="form-hint">
                {selectedPreset
                  ? selectedPreset.description
                  : 'Choose a preset to steer the overall look.'}
              </p>
            </div>
            
            {showCustomStyleModal && editingCustomStyle && (
              <div className="modal-overlay" onClick={() => setShowCustomStyleModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h3>Create Custom Style</h3>
                  <div className="modal-form">
                    <div className="form-section">
                      <label>Style Name *</label>
                      <input
                        type="text"
                        value={editingCustomStyle.name}
                        onChange={(e) => setEditingCustomStyle({ ...editingCustomStyle, name: e.target.value })}
                        placeholder="e.g. retro-futuristic"
                      />
                    </div>
                    <div className="form-section">
                      <label>Style Prompt *</label>
                      <textarea
                        value={editingCustomStyle.prompt}
                        onChange={(e) => setEditingCustomStyle({ ...editingCustomStyle, prompt: e.target.value })}
                        placeholder="Describe the style..."
                        rows={4}
                        className="custom-style-textarea"
                      />
                      <p className="form-hint">
                        Describe the visual style. Example: "ultra minimal, large clean surfaces, crisp gradients, architectural lighting, premium, abstract"
                      </p>
                    </div>
                    <div className="modal-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomStyleModal(false);
                          setEditingCustomStyle(null);
                        }}
                        className="modal-cancel-btn"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={saveCustomStyle}
                        className="modal-save-btn"
                        disabled={!editingCustomStyle.name.trim() || !editingCustomStyle.prompt.trim()}
                      >
                        Save Style
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="form-section">
              <label htmlFor="n">Variants per style</label>
              <input
                id="n"
                type="number"
                value={n}
                onChange={(e) => setN(e.target.value)}
                min="1"
                max="5"
              />
            </div>

            <div className="form-row">
              <div className="form-section">
                <label htmlFor="backgroundSize">Image Size</label>
                <select
                  id="backgroundSize"
                  value={backgroundSize}
                  onChange={(e) => setBackgroundSize(e.target.value as 'landscape' | 'square' | 'portrait')}
                >
                  <option value="landscape">Landscape (1536×1024)</option>
                  <option value="square">Square (1024×1024)</option>
                  <option value="portrait">Portrait (1024×1536)</option>
                </select>
              </div>

              <div className="form-section">
                <label htmlFor="quality">Quality</label>
                <select
                  id="quality"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-section">
                <label htmlFor="format">File Format</label>
                <select
                  id="format"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                >
                  <option value="png">PNG</option>
                  <option value="webp">WebP</option>
                  <option value="jpeg">JPEG</option>
                </select>
              </div>

              {format === 'jpeg' && (
                <div className="form-section">
                  <label htmlFor="compression">Compression ({compression}%)</label>
                  <input
                    id="compression"
                    type="range"
                    min="50"
                    max="100"
                    value={compression}
                    onChange={(e) => setCompression(parseInt(e.target.value))}
                    className="range-slider"
                  />
                  <p className="form-hint">Higher = better quality, larger file</p>
                </div>
              )}

              {format === 'png' && (
                <div className="form-section">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={transparency}
                      onChange={(e) => setTransparency(e.target.checked)}
                    />
                    Transparent background
                  </label>
                  <p className="form-hint">Remove background from hero images</p>
                </div>
              )}
            </div>

            <div className="form-section">
              <label className="checkbox-label demo-mode-toggle">
                <input
                  type="checkbox"
                  checked={demoMode}
                  onChange={(e) => setDemoMode(e.target.checked)}
                />
                Demo Mode (no API key needed)
              </label>
              <p className="form-hint">
                Generates prompts you can copy into ChatGPT - no API costs!
              </p>
            </div>

            {!demoMode && (
              <div className="form-section">
                <label htmlFor="apiKey">OpenAI API Key *</label>
                <input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  required
                />
                <p className="form-hint">
                  Your API key is only used for this request and not stored.
                </p>
              </div>
            )}

            <div className="form-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={cache}
                  onChange={(e) => setCache(e.target.checked)}
                />
                Enable caching
              </label>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {generatedPrompts.filter(Boolean).length > 0 && !isGenerating && (
          <div className="prompts-section">
            <h3>Generated Prompts</h3>
            <p className="prompts-intro">Copy these prompts into ChatGPT to generate your brand assets:</p>
            {generatedPrompts.filter(Boolean).map((p, i) => (
              <div key={i} className="prompt-card">
                <div className="prompt-header">
                  <span className={`prompt-type prompt-type--${p.type}`}>
                    {p.type === 'background' ? 'Background' : 'Hero Edit'}
                  </span>
                  <span className="prompt-style">{p.style}</span>
                  <button
                    type="button"
                    onClick={() => copyPrompt(p.prompt, i)}
                    className="copy-button"
                  >
                    {copiedIndex === i ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="prompt-text">{p.prompt}</pre>
              </div>
            ))}
          </div>
        )}

        {isGenerating && (
          <div className="progress-section">
            {cost && (
              <div className="cost-display">
                <div className="cost-header">
                  <div className="cost-total">
                    <span className="cost-label">API Cost:</span>
                    <span className="cost-value">${cost.totalCost.toFixed(4)}</span>
                  </div>
                  <div className="cost-info-wrapper">
                    <button type="button" className="cost-info-btn" aria-label="Cost information">?</button>
                    <div className="cost-tooltip">
                      <p><strong>How costs are calculated:</strong></p>
                      <p>Based on OpenAI gpt-image-1.5 pricing:</p>
                      <ul>
                        <li><strong>Low quality:</strong> ~$0.01-0.015/image</li>
                        <li><strong>Medium quality:</strong> ~$0.04-0.06/image</li>
                        <li><strong>High quality:</strong> ~$0.17-0.25/image</li>
                      </ul>
                      <p>Each style generates 1 background + 2 hero images (landscape &amp; square) per variant.</p>
                      <p className="cost-tooltip-note">Actual charges may vary based on OpenAI's pricing.</p>
                    </div>
                  </div>
                </div>
                <div className="cost-details">
                  <span>{cost.apiCalls} API calls</span>
                  <span className="cost-separator">|</span>
                  <span>Backgrounds: ${cost.breakdown.backgrounds.toFixed(4)}</span>
                  <span className="cost-separator">|</span>
                  <span>Heroes: ${cost.breakdown.heroes.toFixed(4)}</span>
                </div>
              </div>
            )}
            <div className="progress-bar">
              <div className="progress-fill" />
            </div>
            <div className="progress-log">
              {progress.map((msg, i) => (
                <div key={i} className="progress-message">
                  {msg}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!logoFile || !name.trim() || (!demoMode && !apiKey.trim()) || selectedStyles.length === 0 || isGenerating}
          className="submit-button"
        >
          {isGenerating ? 'Generating...' : demoMode ? 'Generate Demo Brandkit' : 'Generate brandkit'}
        </button>
      </form>
    </div>
  );
}
