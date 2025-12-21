import { useMemo, useState, useCallback } from 'react';
import { 
  Search, 
  Sparkles, 
  X, 
  Copy, 
  Check, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Wand2,
  Image as ImageIcon
} from 'lucide-react';
import { MOOD_CHIPS } from '../../../lib/createConstants';
import { filterChipGroups } from '../chipFilter';
import { formatMoodChipsToPrompt } from '../../../lib/promptPreview';
import { validateMoodChips, isChipIncompatible } from '../../../lib/chipValidation';
import { getSuggestedChips } from '../../../lib/chipSuggestions';
import type { EditingCustomPreset } from '../types';

interface CustomPresetModalProps {
  editing: EditingCustomPreset;
  onChangeName: (name: string) => void;
  onChangeDescription: (description: string) => void;
  onToggleChip: (chipType: 'background' | 'edit', chip: string) => void;
  onSave: () => void;
  onClose: () => void;
  onReorderChips?: (chipType: 'background' | 'edit', newOrder: string[]) => void;
}

export function CustomPresetModal({
  editing,
  onChangeName,
  onChangeDescription,
  onToggleChip,
  onSave,
  onClose,
  onReorderChips,
}: CustomPresetModalProps) {
  const [backgroundQuery, setBackgroundQuery] = useState('');
  const [editQuery, setEditQuery] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [copied, setCopied] = useState<'background' | 'edit' | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<{ type: 'background' | 'edit'; index: number } | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<{ type: 'background' | 'edit'; index: number } | null>(null);

  const filteredBackgroundChips = useMemo(
    () => filterChipGroups(MOOD_CHIPS, backgroundQuery),
    [backgroundQuery]
  );
  const filteredEditChips = useMemo(
    () => filterChipGroups(MOOD_CHIPS, editQuery),
    [editQuery]
  );

  const backgroundValidation = useMemo(
    () => validateMoodChips(editing.backgroundChips),
    [editing.backgroundChips]
  );

  const editValidation = useMemo(
    () => validateMoodChips(editing.editChips),
    [editing.editChips]
  );

  const backgroundSuggestions = useMemo(
    () => getSuggestedChips(editing.backgroundChips, 'mood', 5),
    [editing.backgroundChips]
  );

  const editSuggestions = useMemo(
    () => getSuggestedChips(editing.editChips, 'mood', 5),
    [editing.editChips]
  );

  const backgroundPrompt = useMemo(
    () => formatMoodChipsToPrompt(editing.backgroundChips),
    [editing.backgroundChips]
  );

  const editPrompt = useMemo(
    () => formatMoodChipsToPrompt(editing.editChips),
    [editing.editChips]
  );

  const handleCopyPrompt = useCallback(async (type: 'background' | 'edit') => {
    const text = type === 'background' ? backgroundPrompt : editPrompt;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [backgroundPrompt, editPrompt]);

  // Drag and drop handlers
  const handleDragStart = useCallback((type: 'background' | 'edit', index: number) => {
    setDraggedIndex({ type, index });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, type: 'background' | 'edit', index: number) => {
    e.preventDefault();
    setDragOverIndex({ type, index });
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, type: 'background' | 'edit', dropIndex: number) => {
    e.preventDefault();
    if (!draggedIndex || draggedIndex.type !== type || draggedIndex.index === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const chips = type === 'background' ? editing.backgroundChips : editing.editChips;
    const newOrder = [...chips];
    const [removed] = newOrder.splice(draggedIndex.index, 1);
    newOrder.splice(dropIndex, 0, removed);

    if (onReorderChips) {
      onReorderChips(type, newOrder);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, editing.backgroundChips, editing.editChips, onReorderChips]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  // Get chip category for badge display
  const getChipCategory = useCallback((chip: string) => {
    for (const [category, chips] of Object.entries(MOOD_CHIPS)) {
      if (chips.includes(chip as any)) {
        return category;
      }
    }
    return null;
  }, []);

  const renderChipList = (
    chips: string[],
    type: 'background' | 'edit',
    validation: ReturnType<typeof validateMoodChips>,
    suggestions: string[]
  ) => {
    const isBackground = type === 'background';

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isBackground ? 'bg-brand-teal/10' : 'bg-brand-orange/10'}`}>
              {isBackground ? (
                <ImageIcon className={`w-4 h-4 ${isBackground ? 'text-brand-teal' : 'text-brand-orange'}`} />
              ) : (
                <Wand2 className={`w-4 h-4 ${isBackground ? 'text-brand-teal' : 'text-brand-orange'}`} />
              )}
            </div>
            <div>
              <label className={`text-sm font-bold ${isBackground ? 'text-gray-700' : 'text-brand-orange'}`}>
                {isBackground ? 'Background Moods' : 'Hero/Composition Moods'}
              </label>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isBackground ? 'bg-brand-teal/10 text-brand-teal' : 'bg-brand-orange/10 text-brand-orange'}`}>
                  {chips.length}
                </span>
                {validation.warnings.length > 0 && (
                  <div className="flex items-center gap-1.5 text-amber-600 text-xs bg-amber-50 px-2 py-1 rounded-full">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{validation.warnings.length}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Chips with Drag-and-Drop */}
        <div className={`p-5 rounded-2xl border-2 min-h-[100px] space-y-3 backdrop-blur-sm ${
          isBackground 
            ? 'bg-gradient-to-br from-brand-teal/5 to-teal-50/50 border-brand-teal/20' 
            : 'bg-gradient-to-br from-brand-orange/5 to-orange-50/50 border-brand-orange/20'
        }`}>
          {chips.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {chips.map((chip, index) => {
                const category = getChipCategory(chip);
                const incompatible = isChipIncompatible(chip, chips, 'mood');
                const isDragging = draggedIndex?.type === type && draggedIndex.index === index;
                const isDragOver = dragOverIndex?.type === type && dragOverIndex.index === index;

                return (
                  <div
                    key={`${chip}-${index}`}
                    draggable
                    onDragStart={() => handleDragStart(type, index)}
                    onDragOver={(e) => handleDragOver(e, type, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, type, index)}
                    onDragEnd={handleDragEnd}
                    className={`group relative px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-2 shadow-md transition-all cursor-move transform ${
                      incompatible.incompatible
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                        : isBackground
                        ? 'bg-gradient-to-r from-brand-teal to-teal-600 text-white hover:from-teal-600 hover:to-brand-teal'
                        : 'bg-gradient-to-r from-brand-orange to-orange-600 text-white hover:from-orange-600 hover:to-brand-orange'
                    } ${
                      isDragging ? 'opacity-50 scale-95 rotate-2 z-50' : 'hover:scale-105'
                    } ${
                      isDragOver 
                        ? isBackground 
                          ? 'ring-4 ring-brand-teal/30 ring-offset-2 scale-110' 
                          : 'ring-4 ring-brand-orange/30 ring-offset-2 scale-110'
                        : ''
                    }`}
                  >
                    <GripVertical className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                    {category && (
                      <span className="text-[9px] opacity-80 uppercase tracking-wider px-1.5 py-0.5 bg-white/20 rounded">
                        {category}
                      </span>
                    )}
                    <span>{chip}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleChip(type, chip);
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
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className={`p-3 rounded-full mb-2 ${isBackground ? 'bg-brand-teal/10' : 'bg-brand-orange/10'}`}>
                <Sparkles className={`w-5 h-5 ${isBackground ? 'text-brand-teal' : 'text-brand-orange'}`} />
              </div>
              <span className="text-xs text-gray-400 font-medium">
                Select properties below...
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
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              Suggested
            </label>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((chip) => (
                <button
                  key={chip}
                  onClick={() => onToggleChip(type, chip)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border border-purple-200 hover:from-purple-200 hover:to-purple-100 hover:scale-105 transition-all shadow-sm"
                  type="button"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Prompt Preview */}
        <div className="space-y-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center justify-between w-full text-xs font-bold text-gray-700 hover:text-brand-teal transition-colors group"
            type="button"
          >
            <span className="flex items-center gap-2">
              <Wand2 className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
              {isBackground ? 'Background' : 'Edit'} Prompt Preview
            </span>
            {showPreview ? (
              <ChevronUp className="w-3.5 h-3.5 transition-transform" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 transition-transform" />
            )}
          </button>
          {showPreview && (
            <div className="relative group/preview">
              <div className="p-4 bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 rounded-xl font-mono text-[10px] leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto custom-scrollbar shadow-xl border border-gray-700/50">
                {(isBackground ? backgroundPrompt : editPrompt) || (
                  <span className="text-gray-500 italic">No chips selected yet...</span>
                )}
              </div>
              {(isBackground ? backgroundPrompt : editPrompt) && (
                <button
                  onClick={() => handleCopyPrompt(type)}
                  className="absolute top-2 right-2 p-2 bg-gray-800/80 hover:bg-gray-700 rounded-xl transition-all hover:scale-110 active:scale-95 backdrop-blur-sm shadow-lg"
                  type="button"
                  title="Copy prompt"
                >
                  {copied === type ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-gray-300" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

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
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {editing.id ? 'Edit Preset' : 'New Preset'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Create custom prompt presets</p>
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
          {/* Name and Description */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-brand-teal" />
                Name *
              </label>
              <input
                type="text"
                value={editing.name}
                onChange={(e) => onChangeName(e.target.value)}
                placeholder="e.g. vintage-warm"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-brand-teal/20 focus:border-brand-teal outline-none transition-all bg-white/50 backdrop-blur-sm"
                disabled={!!editing.id}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Description</label>
              <input
                type="text"
                value={editing.description}
                onChange={(e) => onChangeDescription(e.target.value)}
                placeholder="What is it for?"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-brand-teal/20 focus:border-brand-teal outline-none transition-all bg-white/50 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Background Moods */}
          <div className="space-y-4 p-5 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200/50">
            {renderChipList(
              editing.backgroundChips,
              'background',
              backgroundValidation,
              backgroundSuggestions
            )}

            <div className="relative">
              <input
                type="text"
                className="w-full pl-11 pr-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-teal/20 focus:bg-white focus:border-brand-teal outline-none transition-all placeholder:text-gray-400"
                placeholder="Search background moods..."
                value={backgroundQuery}
                onChange={(e) => setBackgroundQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            <div className="space-y-4 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {filteredBackgroundChips.map(([category, chips]) => (
                <div key={String(category)} className="space-y-2">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-1 bg-brand-teal rounded-full"></div>
                    {String(category)}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {chips.map((chip) => {
                      const isSelected = editing.backgroundChips.includes(chip);
                      const incompatible = isChipIncompatible(chip, editing.backgroundChips, 'mood');
                      const isSuggested = backgroundSuggestions.includes(chip);

                      return (
                        <button
                          key={chip}
                          onClick={() => onToggleChip('background', chip)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all transform hover:scale-105 active:scale-95 relative ${
                            isSelected
                              ? 'bg-gradient-to-r from-brand-teal to-teal-600 text-white shadow-lg shadow-brand-teal/30'
                              : incompatible.incompatible
                              ? 'bg-red-50 border-2 border-red-300 text-red-700 hover:bg-red-100'
                              : isSuggested
                              ? 'bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 shadow-sm'
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

          {/* Edit Moods */}
          <div className="space-y-4 p-5 bg-gradient-to-br from-orange-50/30 to-white rounded-2xl border border-brand-orange/20">
            {renderChipList(
              editing.editChips,
              'edit',
              editValidation,
              editSuggestions
            )}

            <div className="relative">
              <input
                type="text"
                className="w-full pl-11 pr-4 py-3 bg-white/50 backdrop-blur-sm border-2 border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-orange/20 focus:bg-white focus:border-brand-orange outline-none transition-all placeholder:text-gray-400"
                placeholder="Search hero/composition moods..."
                value={editQuery}
                onChange={(e) => setEditQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            <div className="space-y-4 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {filteredEditChips.map(([category, chips]) => (
                <div key={String(category)} className="space-y-2">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1 h-1 bg-brand-orange rounded-full"></div>
                    {String(category)}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {chips.map((chip) => {
                      const isSelected = editing.editChips.includes(chip);
                      const incompatible = isChipIncompatible(chip, editing.editChips, 'mood');
                      const isSuggested = editSuggestions.includes(chip);

                      return (
                        <button
                          key={chip}
                          onClick={() => onToggleChip('edit', chip)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all transform hover:scale-105 active:scale-95 relative ${
                            isSelected
                              ? 'bg-gradient-to-r from-brand-orange to-orange-600 text-white shadow-lg shadow-brand-orange/30'
                              : incompatible.incompatible
                              ? 'bg-red-50 border-2 border-red-300 text-red-700 hover:bg-red-100'
                              : isSuggested
                              ? 'bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 shadow-sm'
                              : 'bg-white border border-gray-200 text-gray-700 hover:border-brand-orange/40 hover:bg-brand-orange/5 shadow-sm'
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
            disabled={
              !editing.name.trim() ||
              editing.backgroundChips.length === 0 ||
              editing.editChips.length === 0
            }
            className="flex-1 py-3.5 bg-gradient-to-r from-brand-teal to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-brand-teal/30 hover:shadow-xl hover:shadow-brand-teal/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            type="button"
          >
            Save Preset
          </button>
        </div>
      </div>
    </div>
  );
}
