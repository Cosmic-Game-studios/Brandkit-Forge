import { useMemo, useState, useCallback } from 'react';
import { 
  Palette, 
  X, 
  Copy, 
  Check, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Sparkles,
  Wand2
} from 'lucide-react';
import { STYLE_CHIPS } from '../../../lib/createConstants';
import { filterChipGroups } from '../chipFilter';
import { formatStyleChipsToPrompt } from '../../../lib/promptPreview';
import { validateStyleChips, isChipIncompatible } from '../../../lib/chipValidation';
import { getSuggestedChips } from '../../../lib/chipSuggestions';
import type { EditingCustomStyle } from '../types';

interface CustomStyleModalProps {
  editing: EditingCustomStyle;
  onChangeName: (name: string) => void;
  onToggleChip: (chip: string) => void;
  onResetChips: () => void;
  onClearChips: () => void;
  onSave: () => void;
  onClose: () => void;
  onReorderChips?: (newOrder: string[]) => void;
}

export function CustomStyleModal({
  editing,
  onChangeName,
  onToggleChip,
  onResetChips,
  onClearChips,
  onSave,
  onClose,
  onReorderChips,
}: CustomStyleModalProps) {
  const [query, setQuery] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [copied, setCopied] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const filteredStyleChips = useMemo(
    () => filterChipGroups(STYLE_CHIPS, query),
    [query]
  );

  const validation = useMemo(
    () => validateStyleChips(editing.chips),
    [editing.chips]
  );

  const suggestedChips = useMemo(
    () => getSuggestedChips(editing.chips, 'style', 5),
    [editing.chips]
  );

  const promptPreview = useMemo(
    () => formatStyleChipsToPrompt(editing.chips),
    [editing.chips]
  );

  const handleCopyPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(promptPreview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [promptPreview]);

  // Drag and drop handlers
  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newOrder = [...editing.chips];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, removed);

    if (onReorderChips) {
      onReorderChips(newOrder);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, editing.chips, onReorderChips]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  // Get chip category for badge display
  const getChipCategory = useCallback((chip: string) => {
    for (const [category, chips] of Object.entries(STYLE_CHIPS)) {
      if (chips.includes(chip as any)) {
        return category;
      }
    }
    return null;
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-w-5xl shadow-2xl border border-white/20 p-8 max-h-[92vh] overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        style={{ backgroundImage: 'none', background: '' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-brand-teal to-teal-600 rounded-xl shadow-lg">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Custom Style</h3>
              <p className="text-xs text-gray-500 mt-0.5">Build your unique style with chips</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all hover:scale-110 active:scale-95"
            type="button"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
          {/* Style Name */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-brand-teal" />
              Style Name *
            </label>
            <input
              type="text"
              value={editing.name}
              onChange={(e) => onChangeName(e.target.value)}
              placeholder="e.g. retro-futuristic"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-brand-teal/20 focus:border-brand-teal outline-none transition-all bg-white/50 backdrop-blur-sm"
            />
          </div>

          {/* Selected Chips Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-3">
                <label className="text-sm font-bold text-gray-700">
                  Selected Properties
                </label>
                <span className="px-2.5 py-0.5 bg-brand-teal/10 text-brand-teal rounded-full text-xs font-bold">
                  {editing.chips.length}
                </span>
                {validation.warnings.length > 0 && (
                  <div className="flex items-center gap-1.5 text-amber-600 text-xs bg-amber-50 px-2 py-1 rounded-full">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{validation.warnings.length} warning{validation.warnings.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onResetChips}
                  className="px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-brand-teal hover:bg-brand-teal/5 rounded-lg transition-all"
                  type="button"
                >
                  Reset
                </button>
                <button
                  onClick={onClearChips}
                  className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  type="button"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Selected Chips with Drag-and-Drop */}
            <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border-2 border-gray-200/50 min-h-[120px] space-y-3 backdrop-blur-sm">
              {editing.chips.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {editing.chips.map((chip, index) => {
                    const category = getChipCategory(chip);
                    const incompatible = isChipIncompatible(chip, editing.chips, 'style');
                    const isDragging = draggedIndex === index;
                    const isDragOver = dragOverIndex === index;

                    return (
                      <div
                        key={`${chip}-${index}`}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`group relative px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-move transform ${
                          incompatible.incompatible
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                            : 'bg-gradient-to-r from-brand-teal to-teal-600 text-white hover:from-teal-600 hover:to-brand-teal'
                        } ${
                          isDragging ? 'opacity-50 scale-95 rotate-2 z-50' : 'hover:scale-105'
                        } ${
                          isDragOver ? 'ring-4 ring-brand-teal/30 ring-offset-2 scale-110' : ''
                        }`}
                      >
                        <GripVertical className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                        {category && (
                          <span className="text-[10px] opacity-80 uppercase tracking-wider px-1.5 py-0.5 bg-white/20 rounded">
                            {category}
                          </span>
                        )}
                        <span>{chip}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleChip(chip);
                          }}
                          className="ml-1 hover:bg-white/20 rounded-md p-1 transition-all hover:scale-110 active:scale-95"
                          type="button"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {incompatible.incompatible && (
                          <div className="absolute -top-1.5 -right-1.5 bg-red-600 rounded-full p-1 shadow-lg animate-pulse">
                            <AlertTriangle className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="p-4 bg-gray-200/50 rounded-full mb-3">
                    <Sparkles className="w-6 h-6 text-gray-400" />
                  </div>
                  <span className="text-sm text-gray-400 font-medium">
                    Select properties below to build your style
                  </span>
                </div>
              )}
            </div>

            {/* Validation Warnings */}
            {validation.warnings.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200/50 rounded-xl space-y-2 backdrop-blur-sm">
                {validation.warnings.map((warning, idx) => (
                  <div key={idx} className="text-xs text-amber-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
                    <span className="font-medium">{warning.reason}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Suggested Chips */}
            {suggestedChips.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  Suggested for you
                </label>
                <div className="flex flex-wrap gap-2">
                  {suggestedChips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => onToggleChip(chip)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border border-purple-200 hover:from-purple-200 hover:to-purple-100 hover:scale-105 transition-all shadow-sm"
                      type="button"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chip Selection */}
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                className="w-full pl-11 pr-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-teal/20 focus:bg-white focus:border-brand-teal outline-none transition-all placeholder:text-gray-400"
                placeholder="Search properties..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Palette className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            <div className="space-y-5 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {filteredStyleChips.map(([category, chips]) => (
                <div key={String(category)} className="space-y-3">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-1 bg-brand-teal rounded-full"></div>
                    {String(category)}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {chips.map((chip) => {
                      const isSelected = editing.chips.includes(chip);
                      const incompatible = isChipIncompatible(chip, editing.chips, 'style');
                      const isSuggested = suggestedChips.includes(chip);

                      return (
                        <button
                          key={chip}
                          onClick={() => onToggleChip(chip)}
                          className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all transform hover:scale-105 active:scale-95 relative ${
                            isSelected
                              ? 'bg-gradient-to-r from-brand-teal to-teal-600 text-white shadow-lg shadow-brand-teal/30'
                              : incompatible.incompatible
                              ? 'bg-red-50 border-2 border-red-300 text-red-700 hover:bg-red-100 hover:border-red-400'
                              : isSuggested
                              ? 'bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300 shadow-sm'
                              : 'bg-white border border-gray-200 text-gray-700 hover:border-brand-teal/40 hover:bg-brand-teal/5 shadow-sm'
                          }`}
                          type="button"
                          title={
                            incompatible.incompatible
                              ? `Conflicts with: ${incompatible.conflictingChips.join(', ')}`
                              : undefined
                          }
                        >
                          {chip}
                          {isSuggested && !isSelected && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-white shadow-sm animate-pulse" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Prompt Preview */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center justify-between w-full text-sm font-bold text-gray-700 hover:text-brand-teal transition-colors group"
              type="button"
            >
              <span className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                Prompt Preview
              </span>
              {showPreview ? (
                <ChevronUp className="w-4 h-4 transition-transform" />
              ) : (
                <ChevronDown className="w-4 h-4 transition-transform" />
              )}
            </button>
            {showPreview && (
              <div className="relative group/preview">
                <div className="p-5 bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 rounded-2xl font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto custom-scrollbar shadow-xl border border-gray-700/50">
                  {promptPreview || (
                    <span className="text-gray-500 italic">No chips selected yet. Start building your style above...</span>
                  )}
                </div>
                {promptPreview && (
                  <button
                    onClick={handleCopyPrompt}
                    className="absolute top-3 right-3 p-2.5 bg-gray-800/80 hover:bg-gray-700 rounded-xl transition-all hover:scale-110 active:scale-95 backdrop-blur-sm shadow-lg"
                    type="button"
                    title="Copy prompt"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-300" />
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!editing.name.trim() || editing.chips.length === 0}
            className="flex-1 py-3.5 bg-gradient-to-r from-brand-teal to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-brand-teal/30 hover:shadow-xl hover:shadow-brand-teal/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            type="button"
          >
            Save Style
          </button>
        </div>
      </div>
    </div>
  );
}
