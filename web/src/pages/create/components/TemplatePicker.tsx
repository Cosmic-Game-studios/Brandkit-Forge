import { useState } from 'react';
import {
  Monitor, Palette, Landmark, UtensilsCrossed, Gem, Heart,
  Gamepad2, GraduationCap, Music, Leaf, Scissors, Minus,
  ChevronDown, ChevronUp, Sparkles, X,
} from 'lucide-react';

export interface BrandTemplate {
  id: string;
  name: string;
  industry: string;
  description: string;
  icon: string;
  styles: string[];
  preset: string;
  suggestedColors: string[];
  backgroundSize: 'landscape' | 'square' | 'portrait';
  n: number;
  quality: 'low' | 'medium' | 'high';
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Monitor, Palette, Landmark, UtensilsCrossed, Gem, Heart,
  Gamepad2, GraduationCap, Music, Leaf, Scissors, Minus,
};

const TEMPLATES: BrandTemplate[] = [
  {
    id: 'tech-startup', name: 'Tech Startup', industry: 'Technology',
    description: 'Clean, modern look with bold gradients. Perfect for SaaS and apps.',
    icon: 'Monitor', styles: ['minimal', 'gradient', 'glassmorphism'], preset: 'core',
    suggestedColors: ['#6366f1', '#06b6d4', '#1e1b4b'], backgroundSize: 'landscape', n: 2, quality: 'high',
  },
  {
    id: 'creative-agency', name: 'Creative Agency', industry: 'Creative',
    description: 'Expressive, artistic designs with watercolor touches.',
    icon: 'Palette', styles: ['watercolor', 'gradient', 'clay'], preset: 'bold',
    suggestedColors: ['#ec4899', '#f59e0b', '#7c3aed'], backgroundSize: 'landscape', n: 3, quality: 'high',
  },
  {
    id: 'finance', name: 'Finance & Banking', industry: 'Finance',
    description: 'Professional, trustworthy aesthetic with premium feel.',
    icon: 'Landmark', styles: ['minimal', 'blueprint', 'glassmorphism'], preset: 'noir',
    suggestedColors: ['#0f172a', '#1e40af', '#d4af37'], backgroundSize: 'landscape', n: 2, quality: 'high',
  },
  {
    id: 'food-beverage', name: 'Food & Beverage', industry: 'Food',
    description: 'Warm, appetizing visuals with organic textures.',
    icon: 'UtensilsCrossed', styles: ['watercolor', 'retro', 'clay'], preset: 'fresh',
    suggestedColors: ['#dc2626', '#f59e0b', '#16a34a'], backgroundSize: 'square', n: 2, quality: 'high',
  },
  {
    id: 'fashion', name: 'Fashion & Luxury', industry: 'Fashion',
    description: 'Elegant, high-fashion aesthetic with noir tones.',
    icon: 'Gem', styles: ['minimal', 'glassmorphism', 'gradient'], preset: 'noir',
    suggestedColors: ['#000000', '#d4af37', '#f5f5f5'], backgroundSize: 'portrait', n: 2, quality: 'high',
  },
  {
    id: 'health-wellness', name: 'Health & Wellness', industry: 'Health',
    description: 'Calming, balanced designs with serene colors.',
    icon: 'Heart', styles: ['minimal', 'watercolor', 'gradient'], preset: 'zen',
    suggestedColors: ['#10b981', '#06b6d4', '#f0fdf4'], backgroundSize: 'landscape', n: 2, quality: 'high',
  },
  {
    id: 'gaming', name: 'Gaming & Esports', industry: 'Gaming',
    description: 'High-energy visuals with neon accents and dynamic motion.',
    icon: 'Gamepad2', styles: ['neon', 'gradient', 'glassmorphism'], preset: 'electric',
    suggestedColors: ['#a855f7', '#06b6d4', '#ec4899'], backgroundSize: 'landscape', n: 3, quality: 'high',
  },
  {
    id: 'education', name: 'Education', industry: 'Education',
    description: 'Friendly, accessible designs with bright colors.',
    icon: 'GraduationCap', styles: ['clay', 'minimal', 'gradient'], preset: 'fresh',
    suggestedColors: ['#3b82f6', '#f59e0b', '#10b981'], backgroundSize: 'landscape', n: 2, quality: 'high',
  },
  {
    id: 'music-entertainment', name: 'Music & Entertainment', industry: 'Entertainment',
    description: 'Bold, vibrant aesthetic with retro-futuristic flair.',
    icon: 'Music', styles: ['retro', 'neon', 'gradient'], preset: 'electric',
    suggestedColors: ['#ef4444', '#8b5cf6', '#f97316'], backgroundSize: 'square', n: 2, quality: 'high',
  },
  {
    id: 'eco-sustainable', name: 'Eco & Sustainable', industry: 'Environment',
    description: 'Natural, earth-toned designs with organic textures.',
    icon: 'Leaf', styles: ['watercolor', 'minimal', 'clay'], preset: 'zen',
    suggestedColors: ['#16a34a', '#84cc16', '#713f12'], backgroundSize: 'landscape', n: 2, quality: 'high',
  },
  {
    id: 'vintage-craft', name: 'Vintage & Craft', industry: 'Craft',
    description: 'Nostalgic, handcrafted feel with warm retro tones.',
    icon: 'Scissors', styles: ['retro', 'watercolor', 'blueprint'], preset: 'vintage',
    suggestedColors: ['#92400e', '#b45309', '#fef3c7'], backgroundSize: 'square', n: 2, quality: 'high',
  },
  {
    id: 'minimal-modern', name: 'Minimal Modern', industry: 'General',
    description: 'Ultra-clean, contemporary aesthetic. Universal choice.',
    icon: 'Minus', styles: ['minimal', 'glassmorphism'], preset: 'soft',
    suggestedColors: ['#18181b', '#71717a', '#fafafa'], backgroundSize: 'landscape', n: 2, quality: 'high',
  },
];

interface TemplatePickerProps {
  onSelect: (template: BrandTemplate) => void;
  onClose: () => void;
}

export default function TemplatePicker({ onSelect, onClose }: TemplatePickerProps) {
  const [expanded, setExpanded] = useState(true);

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-brand-teal/30 dark:border-brand-teal/20 text-brand-teal hover:bg-brand-teal/5 dark:hover:bg-brand-teal/10 transition-colors text-sm font-medium"
      >
        <span className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Quick Start with Industry Template
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-lg animate-fade-in overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] bg-gradient-to-r from-brand-teal/5 to-brand-orange/5 dark:from-brand-teal/10 dark:to-brand-orange/10">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-teal" />
          Quick Start Templates
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(false)}
            className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 p-3 max-h-[320px] overflow-y-auto custom-scrollbar">
        {TEMPLATES.map((template) => {
          const IconComponent = ICON_MAP[template.icon] || Monitor;
          return (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className="group flex flex-col items-start gap-2 p-3 rounded-xl border border-[var(--border)] hover:border-brand-teal/40 dark:hover:border-brand-teal/30 hover:bg-brand-teal/5 dark:hover:bg-brand-teal/10 transition-all text-left"
            >
              <div className="flex items-center gap-2 w-full">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-teal/10 to-brand-orange/10 dark:from-brand-teal/20 dark:to-brand-orange/20 flex items-center justify-center shrink-0 group-hover:from-brand-teal/20 group-hover:to-brand-orange/20">
                  <IconComponent className="w-4 h-4 text-brand-teal" />
                </div>
                <span className="text-xs font-semibold truncate">{template.name}</span>
              </div>
              <p className="text-[10px] leading-tight text-[var(--text-muted)] line-clamp-2">
                {template.description}
              </p>
              <div className="flex gap-1 flex-wrap">
                {template.suggestedColors.map((color) => (
                  <div
                    key={color}
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
