import { CheckCircle2, Copy, Sparkles, Terminal, DollarSign } from 'lucide-react';
import type { CostInfo, DemoPromptEntry } from '../types';

interface ProgressPanelProps {
  isGenerating: boolean;
  demoMode: boolean;
  progress: string[];
  cost: CostInfo | null;
  generatedPrompts: DemoPromptEntry[];
  copiedIndex: number | null;
  onCopyPrompt: (prompt: string, index: number) => void;
}

export function ProgressPanel({
  isGenerating,
  demoMode,
  progress,
  cost,
  generatedPrompts,
  copiedIndex,
  onCopyPrompt,
}: ProgressPanelProps) {
  const shouldShow = isGenerating || (demoMode && generatedPrompts.length > 0);
  if (!shouldShow) return null;

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border-2 border-white/20 space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-gray-900 flex items-center gap-3">
          {isGenerating ? (
            <>
              <div className="p-2 bg-brand-teal/10 rounded-xl">
                <Terminal className="w-5 h-5 text-brand-teal" />
              </div>
              <div>
                <span className="text-lg">Progress</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-2 h-2 bg-brand-teal rounded-full animate-pulse" />
                  <span className="text-xs text-gray-500">Processing...</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-2 bg-brand-orange/10 rounded-xl">
                <Sparkles className="w-5 h-5 text-brand-orange" />
              </div>
              <div>
                <span className="text-lg">Generated Prompts</span>
                <span className="text-xs text-gray-500 block mt-0.5">{generatedPrompts.length} prompts ready</span>
              </div>
            </>
          )}
        </h3>

        <div className="flex items-center gap-2">
          {cost && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-brand-teal/10 to-teal-50 text-brand-teal rounded-full text-xs font-bold shadow-sm">
              <DollarSign className="w-3.5 h-3.5" />
              ${cost.totalCost.toFixed(4)}
            </div>
          )}
          {demoMode && (
            <span className="px-3 py-1.5 bg-gradient-to-r from-brand-orange/10 to-orange-50 text-brand-orange rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
              Demo Mode
            </span>
          )}
        </div>
      </div>

      {isGenerating && (
        <div className="space-y-4">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-teal to-teal-600 animate-progress rounded-full" />
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 font-mono text-xs text-brand-teal/80 h-48 overflow-y-auto space-y-1.5 custom-scrollbar shadow-xl border border-gray-700/50">
            {progress.map((msg, i) => (
              <div key={i} className="flex gap-2">
                <span className="opacity-40 text-gray-500">[{new Date().toLocaleTimeString()}]</span>
                <span className="text-gray-200">{msg}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {demoMode && generatedPrompts.length > 0 && (
        <div className="space-y-4">
          <div className="grid gap-4">
            {generatedPrompts.map((p, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200/50 shadow-lg overflow-hidden group hover:shadow-xl transition-all"
              >
                <div className="px-6 py-4 bg-white border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg shadow-sm ${
                        p.type === 'background'
                          ? 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-gradient-to-r from-brand-orange/10 to-orange-50 text-brand-orange border border-brand-orange/20'
                      }`}
                    >
                      {p.type}
                    </span>
                    <span className="text-sm font-bold text-gray-700 capitalize">
                      {p.style}
                    </span>
                  </div>

                  <button
                    onClick={() => onCopyPrompt(p.prompt, i)}
                    className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all transform hover:scale-105 active:scale-95 bg-brand-teal/5 text-brand-teal hover:bg-brand-teal hover:text-white shadow-sm"
                    type="button"
                  >
                    {copiedIndex === i ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copy
                      </>
                    )}
                  </button>
                </div>

                <div className="p-6">
                  <pre className="text-xs text-gray-600 font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
                    {p.prompt}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
