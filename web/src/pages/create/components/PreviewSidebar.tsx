import { Hammer, Info } from 'lucide-react';
import type {
  BackgroundSize,
  CostEstimate,
  ImageFormat,
  ImageQuality,
} from '../../../types';

interface PreviewSidebarProps {
  logoPreview: string | null;
  name: string;
  tagline: string;
  selectedStyles: string[];
  colors: string[];
  format: ImageFormat;
  quality: ImageQuality;
  backgroundSize: BackgroundSize;
  n: string;
  estimatedCost: CostEstimate;
}

export function PreviewSidebar({
  logoPreview,
  name,
  tagline,
  selectedStyles,
  colors,
  format,
  quality,
  backgroundSize,
  n,
  estimatedCost,
}: PreviewSidebarProps) {
  const variantCount = Number.parseInt(n, 10) || 0;
  const hasSelections = selectedStyles.length > 0;
  const costNudge =
    hasSelections && variantCount > 0
      ? `Current setup: ${selectedStyles.length} style${
          selectedStyles.length === 1 ? '' : 's'
        } × ${variantCount} variant${variantCount === 1 ? '' : 's'}.`
      : 'Select at least one style and a variant count to see cost guidance.';

  return (
    <div className="space-y-6">
      <div className="sticky top-28 space-y-6">
        {/* Live Preview Card */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 space-y-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4">
            <div className="px-3 py-1 bg-white/80 backdrop-blur rounded-full text-[10px] font-bold text-gray-500 shadow-sm border border-gray-100 uppercase tracking-widest">
              Preview
            </div>
          </div>

          <div className="space-y-4 pt-4 text-center">
            <div className="aspect-square w-24 h-24 mx-auto rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center p-4 shadow-inner">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo"
                  className="max-w-full max-h-full object-contain drop-shadow-sm"
                />
              ) : (
                <Hammer className="w-8 h-8 text-gray-200" />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-900 truncate px-4">
                {name || 'Your Brand'}
              </h3>
              <p className="text-xs text-gray-500 italic truncate px-4">
                {tagline || 'Your tagline here...'}
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-gray-50">
            <div className="flex flex-wrap gap-2">
              {selectedStyles.slice(0, 4).map((style, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-gray-50 text-[10px] font-bold text-gray-500 rounded-full border border-gray-100 uppercase tracking-wider"
                >
                  {style}
                </span>
              ))}
              {selectedStyles.length > 4 && (
                <span className="px-3 py-1 bg-gray-50 text-[10px] font-bold text-gray-500 rounded-full border border-gray-100 uppercase tracking-wider">
                  +{selectedStyles.length - 4}
                </span>
              )}
              {selectedStyles.length === 0 && (
                <span className="text-[10px] text-gray-400 italic">
                  No styles selected yet
                </span>
              )}
            </div>

            <div className="flex gap-1.5 h-6">
              {colors.length > 0 ? (
                colors.map((c, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-full shadow-inner"
                    style={{ backgroundColor: c }}
                  />
                ))
              ) : (
                <div className="flex-1 rounded-full bg-gray-50 border border-dashed border-gray-200" />
              )}
            </div>

            <div className="grid grid-cols-2 gap-y-3 pt-2 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
              <div>
                Format: <span className="text-gray-900">{format}</span>
              </div>
              <div>
                Quality: <span className="text-gray-900">{quality}</span>
              </div>
              <div>
                Size:{' '}
                <span className="text-gray-900 capitalize">{backgroundSize}</span>
              </div>
              <div>
                Variants: <span className="text-gray-900">{n}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Estimate Card */}
        {selectedStyles.length > 0 && (
          <div className="bg-gradient-to-br from-brand-teal to-brand-teal/80 rounded-3xl p-6 text-white shadow-lg shadow-brand-teal/20 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest opacity-80">
                Estimated Cost
              </span>
              <div className="relative group">
                <Info className="w-4 h-4 opacity-60 cursor-help" />
                <div className="absolute bottom-full right-0 mb-2 w-64 p-4 bg-white text-gray-600 text-[10px] leading-relaxed rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <p className="font-bold text-gray-900 mb-2">
                    How costs are calculated:
                  </p>
                  <p className="mb-2 italic">Based on OpenAI gpt-image-1.5 pricing:</p>
                  <ul className="space-y-1 mb-2">
                    <li>• Low: ~$0.04/style/variant</li>
                    <li>• Medium: ~$0.16/style/variant</li>
                    <li>• High: ~$0.67/style/variant</li>
                  </ul>
                  <p>Each style generates 1 background + 2 hero images per variant.</p>
                </div>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black">
                ${estimatedCost.totalCost.toFixed(2)}
              </span>
              <span className="text-xs font-bold opacity-60">USD</span>
            </div>
            <div className="text-[10px] font-bold opacity-80 pt-2 border-t border-white/20">
              {estimatedCost.numStyles} STYLES × {estimatedCost.variants} VARIANTS ={' '}
              {estimatedCost.totalApiCalls} API CALLS
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
              Update: Cost Optimization
            </span>
            <div className="px-2.5 py-1 rounded-full bg-brand-teal/10 text-[10px] font-bold text-brand-teal uppercase tracking-widest">
              New
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            Save budget and improve image quality with small tweaks.
          </p>
          <p className="text-xs text-gray-500 font-medium">{costNudge}</p>
          <ul className="space-y-2 text-xs text-gray-600 leading-relaxed">
            <li>• Reduce variants or styles to lower API costs immediately.</li>
            <li>• Choose “Medium” for balance and use “High” only for final assets.</li>
            <li>• Use PNG + transparency for logos and WebP/JPEG for lighter hero images.</li>
            <li>• Keep the logo clean: high contrast and minimal text deliver better results.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
