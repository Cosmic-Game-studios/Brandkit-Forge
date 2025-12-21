import { ChevronLeft, Info, Settings2, Sparkles, Zap, Image as ImageIcon, Layers } from 'lucide-react';
import type { BackgroundSize, ImageFormat, ImageQuality } from '../../../types';

interface ConfigurationStepProps {
  quality: ImageQuality;
  onSetQuality: (quality: ImageQuality) => void;

  format: ImageFormat;
  onSetFormat: (format: ImageFormat) => void;

  transparency: boolean;
  onSetTransparency: (value: boolean) => void;

  backgroundSize: BackgroundSize;
  onSetBackgroundSize: (value: BackgroundSize) => void;

  n: string;
  onSetN: (value: string) => void;

  apiKey: string;
  onSetApiKey: (value: string) => void;

  demoMode: boolean;
  onSetDemoMode: (value: boolean) => void;

  isGenerating: boolean;
  onPrev: () => void;
}

export function ConfigurationStep({
  quality,
  onSetQuality,
  format,
  onSetFormat,
  transparency,
  onSetTransparency,
  backgroundSize,
  onSetBackgroundSize,
  n,
  onSetN,
  apiKey,
  onSetApiKey,
  demoMode,
  onSetDemoMode,
  isGenerating,
  onPrev,
}: ConfigurationStepProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-brand-teal to-teal-600 rounded-xl shadow-lg">
            <Settings2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Configuration</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              Fine-tune settings for your images and API details
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Visual Settings */}
          <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200/50">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-4 h-4 text-brand-teal" />
              <h3 className="text-sm font-bold text-gray-700">Visual Settings</h3>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Image Quality</label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as ImageQuality[]).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => onSetQuality(q)}
                    className={`py-3 rounded-xl text-xs font-bold capitalize transition-all border-2 transform hover:scale-105 active:scale-95 ${
                      quality === q
                        ? 'bg-gradient-to-r from-brand-teal to-teal-600 text-white border-brand-teal shadow-lg shadow-brand-teal/30'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-brand-teal/50 hover:bg-brand-teal/5 shadow-sm'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                Image Format & Transparency
              </label>
              <div className="flex gap-3">
                <select
                  value={format}
                  onChange={(e) => onSetFormat(e.target.value as ImageFormat)}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 outline-none focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/20 text-sm bg-white transition-all"
                >
                  <option value="png">PNG</option>
                  <option value="webp">WebP</option>
                  <option value="jpeg">JPEG</option>
                </select>
                {format === 'png' && (
                  <label className="flex items-center gap-2 cursor-pointer px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-brand-teal/50 transition-all">
                    <input
                      type="checkbox"
                      checked={transparency}
                      onChange={(e) => onSetTransparency(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-teal focus:ring-brand-teal border-gray-300"
                    />
                    <span className="text-xs font-semibold text-gray-600">
                      Transparent
                    </span>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Generation Settings */}
          <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200/50">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-brand-teal" />
              <h3 className="text-sm font-bold text-gray-700">Generation Settings</h3>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Variants per Style</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={n}
                  onChange={(e) => onSetN(e.target.value)}
                  className="flex-1 h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-teal"
                />
                <span className="w-12 h-12 bg-gradient-to-br from-brand-teal to-teal-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg">
                  {n}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Main Image Format</label>
              <select
                value={backgroundSize}
                onChange={(e) => onSetBackgroundSize(e.target.value as BackgroundSize)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 outline-none focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/20 text-sm bg-white transition-all"
              >
                <option value="landscape">Landscape (1536×1024)</option>
                <option value="square">Square (1024×1024)</option>
                <option value="portrait">Portrait (1024×1536)</option>
              </select>
            </div>
          </div>
        </div>

        {/* API Section */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200/50 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${demoMode ? 'bg-brand-orange/10' : 'bg-brand-teal/10'}`}>
                <Zap className={`w-5 h-5 ${demoMode ? 'text-brand-orange' : 'text-brand-teal'}`} />
              </div>
              <span className="font-bold text-gray-900">OpenAI API Access</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-full border-2 border-gray-200 shadow-sm hover:border-brand-orange/50 transition-all">
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => onSetDemoMode(e.target.checked)}
                className="w-4 h-4 rounded text-brand-orange focus:ring-brand-orange border-gray-300"
              />
              <span className="text-xs font-bold text-gray-700">Demo Mode</span>
            </label>
          </div>

          {!demoMode ? (
            <div className="space-y-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => onSetApiKey(e.target.value)}
                placeholder="OpenAI API Key (sk-...)"
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-brand-teal/20 focus:border-brand-teal outline-none transition-all text-sm font-mono bg-white"
                required
              />
              <p className="text-[10px] text-gray-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Your key is only used for this request and not stored.
              </p>
            </div>
          ) : (
            <div className="text-xs text-brand-orange bg-gradient-to-r from-brand-orange/5 to-orange-50 p-4 rounded-xl border-2 border-brand-orange/20 font-medium leading-relaxed">
              In Demo Mode, only prompts are generated. You can copy them and use them
              manually with ChatGPT/DALL-E. No API costs!
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-2 text-gray-600 px-6 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-all transform hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <button
          type="submit"
          disabled={(!demoMode && !apiKey.trim()) || isGenerating}
          className="flex items-center gap-3 bg-gradient-to-r from-brand-teal to-teal-600 text-white px-10 py-4 rounded-2xl font-bold hover:shadow-xl hover:shadow-brand-teal/40 disabled:opacity-50 transition-all transform hover:scale-105 active:scale-95 disabled:transform-none"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Forging...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Forge Brandkit
            </>
          )}
        </button>
      </div>
    </div>
  );
}
