import { 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Edit2, 
  Palette, 
  Plus, 
  Trash2,
  Sparkles
} from 'lucide-react';
import { AVAILABLE_STYLES, PRESET_OPTIONS } from '../../../lib/createConstants';
import type { CustomPresetMap, CustomStyleMap } from '../../../types';

interface AestheticsStepProps {
  selectedStyles: string[];
  customStyles: CustomStyleMap;
  onToggleStyle: (style: string) => void;
  onAddCustomStyle: () => void;
  onEditCustomStyle: (styleName: string) => void;
  onDeleteCustomStyle: (styleName: string) => void;

  colors: string[];
  onAddColor: () => void;
  onRemoveColor: (index: number) => void;
  onUpdateColor: (index: number, value: string) => void;

  preset: string;
  customPresets: CustomPresetMap;
  onSetPreset: (presetId: string) => void;
  onAddCustomPreset: () => void;
  onEditCustomPreset: (presetId: string) => void;
  onDeleteCustomPreset: (presetId: string) => void;

  onPrev: () => void;
  onNext: () => void;
}

export function AestheticsStep({
  selectedStyles,
  customStyles,
  onToggleStyle,
  onAddCustomStyle,
  onEditCustomStyle,
  onDeleteCustomStyle,
  colors,
  onAddColor,
  onRemoveColor,
  onUpdateColor,
  preset,
  customPresets,
  onSetPreset,
  onAddCustomPreset,
  onEditCustomPreset,
  onDeleteCustomPreset,
  onPrev,
  onNext,
}: AestheticsStepProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-brand-teal to-teal-600 rounded-xl shadow-lg">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Brand Aesthetics</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              Choose styles and colors that reflect your brand identity
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Styles Selection */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-teal" />
              Select Styles *
            </label>
            <button
              type="button"
              onClick={onAddCustomStyle}
              className="px-4 py-2 text-brand-teal text-sm font-bold flex items-center gap-2 hover:bg-brand-teal/5 rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Custom Style
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {AVAILABLE_STYLES.map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => onToggleStyle(style)}
                className={`p-4 rounded-xl border-2 transition-all text-sm font-semibold capitalize transform hover:scale-105 active:scale-95 ${
                  selectedStyles.includes(style)
                    ? 'border-brand-teal bg-gradient-to-br from-brand-teal/10 to-teal-50 text-brand-teal shadow-lg shadow-brand-teal/20'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 shadow-sm'
                }`}
              >
                {style}
              </button>
            ))}
            {Object.keys(customStyles).map((styleName) => (
              <div key={styleName} className="relative group">
                <button
                  type="button"
                  onClick={() => onToggleStyle(styleName)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-sm font-semibold capitalize pr-12 transform hover:scale-105 active:scale-95 ${
                    selectedStyles.includes(styleName)
                      ? 'border-brand-teal bg-gradient-to-br from-brand-teal/10 to-teal-50 text-brand-teal shadow-lg shadow-brand-teal/20'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  {styleName}
                </button>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => onEditCustomStyle(styleName)}
                    className="p-1.5 hover:bg-brand-teal/10 hover:text-brand-teal rounded-lg transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteCustomStyle(styleName)}
                    className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-pink-500 to-purple-500"></div>
            Brand Colors
          </label>
          <div className="flex flex-wrap gap-3">
            {colors.map((color, index) => (
              <div
                key={index}
                className="flex items-center gap-2.5 p-3 bg-white rounded-xl border-2 border-gray-200 shadow-md hover:shadow-lg transition-all hover:scale-105"
              >
                <div className="relative">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => onUpdateColor(index, e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200 shadow-sm hover:shadow-md transition-all"
                  />
                  <div 
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{ backgroundColor: color }}
                  />
                </div>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => onUpdateColor(index, e.target.value)}
                  className="w-24 text-xs font-mono bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => onRemoveColor(index)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={onAddColor}
              className="flex items-center gap-2 px-5 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-brand-teal hover:text-brand-teal hover:bg-brand-teal/5 transition-all transform hover:scale-105 active:scale-95 font-semibold text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Color
            </button>
          </div>
        </div>

        {/* Presets */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label htmlFor="preset" className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-teal" />
              Prompt Preset
            </label>
            <button
              type="button"
              onClick={onAddCustomPreset}
              className="px-4 py-2 text-brand-teal text-sm font-bold flex items-center gap-2 hover:bg-brand-teal/5 rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Custom Preset
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Built-in Presets */}
            {PRESET_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSetPreset(opt.id)}
                className={`p-5 rounded-2xl border-2 text-left transition-all transform hover:scale-[1.02] active:scale-[0.98] relative ${
                  preset === opt.id
                    ? 'border-brand-teal bg-gradient-to-br from-brand-teal/10 to-teal-50 ring-4 ring-brand-teal/10 shadow-xl shadow-brand-teal/20'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 shadow-md hover:shadow-lg'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`font-bold text-lg ${
                      preset === opt.id ? 'text-brand-teal' : 'text-gray-900'
                    }`}
                  >
                    {opt.name}
                  </span>
                  {preset === opt.id && (
                    <div className="p-1.5 bg-brand-teal rounded-full shadow-lg">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{opt.description}</p>
              </button>
            ))}
            
            {/* Custom Presets */}
            {Object.entries(customPresets).map(([presetId, presetData]) => (
              <div
                key={presetId}
                className={`p-5 rounded-2xl border-2 text-left transition-all transform hover:scale-[1.02] active:scale-[0.98] relative ${
                  preset === presetId
                    ? 'border-brand-teal bg-gradient-to-br from-brand-teal/10 to-teal-50 ring-4 ring-brand-teal/10 shadow-xl shadow-brand-teal/20'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 shadow-md hover:shadow-lg'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSetPreset(presetId)}
                  className="w-full text-left"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className={`font-bold text-lg ${
                        preset === presetId ? 'text-brand-teal' : 'text-gray-900'
                      }`}
                    >
                      {presetId.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </span>
                    <div className="flex items-center gap-2">
                      {preset === presetId && (
                        <div className="p-1.5 bg-brand-teal rounded-full shadow-lg">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{presetData.description}</p>
                </button>
                <div className="absolute top-3 right-3 flex gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCustomPreset(presetId);
                    }}
                    className="p-1.5 text-gray-400 hover:text-brand-teal hover:bg-brand-teal/10 rounded-lg transition-all"
                    aria-label="Edit preset"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCustomPreset(presetId);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    aria-label="Delete preset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-2 text-gray-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all transform hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={selectedStyles.length === 0}
          className="flex items-center gap-2 bg-gradient-to-r from-brand-teal to-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:from-teal-600 hover:to-brand-teal disabled:opacity-50 transition-all shadow-lg shadow-brand-teal/30 hover:shadow-xl hover:shadow-brand-teal/40 transform hover:scale-105 active:scale-95 disabled:transform-none"
        >
          Continue to Configuration
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
