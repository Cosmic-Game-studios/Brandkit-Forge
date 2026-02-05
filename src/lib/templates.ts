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

const TEMPLATES: BrandTemplate[] = [
  {
    id: 'tech-startup',
    name: 'Tech Startup',
    industry: 'Technology',
    description: 'Clean, modern look with bold gradients and sharp edges. Perfect for SaaS, apps, and developer tools.',
    icon: 'Monitor',
    styles: ['minimal', 'gradient', 'glassmorphism'],
    preset: 'core',
    suggestedColors: ['#6366f1', '#06b6d4', '#1e1b4b'],
    backgroundSize: 'landscape',
    n: 2,
    quality: 'high',
  },
  {
    id: 'creative-agency',
    name: 'Creative Agency',
    industry: 'Creative',
    description: 'Expressive, artistic designs with watercolor touches and bold contrasts. Ideal for design studios and agencies.',
    icon: 'Palette',
    styles: ['watercolor', 'gradient', 'clay'],
    preset: 'bold',
    suggestedColors: ['#ec4899', '#f59e0b', '#7c3aed'],
    backgroundSize: 'landscape',
    n: 3,
    quality: 'high',
  },
  {
    id: 'finance',
    name: 'Finance & Banking',
    industry: 'Finance',
    description: 'Professional, trustworthy aesthetic with dark tones and premium feel. Suited for fintech and banking.',
    icon: 'Landmark',
    styles: ['minimal', 'blueprint', 'glassmorphism'],
    preset: 'noir',
    suggestedColors: ['#0f172a', '#1e40af', '#d4af37'],
    backgroundSize: 'landscape',
    n: 2,
    quality: 'high',
  },
  {
    id: 'food-beverage',
    name: 'Food & Beverage',
    industry: 'Food',
    description: 'Warm, appetizing visuals with organic textures and inviting colors. Great for restaurants and food brands.',
    icon: 'UtensilsCrossed',
    styles: ['watercolor', 'retro', 'clay'],
    preset: 'fresh',
    suggestedColors: ['#dc2626', '#f59e0b', '#16a34a'],
    backgroundSize: 'square',
    n: 2,
    quality: 'high',
  },
  {
    id: 'fashion',
    name: 'Fashion & Luxury',
    industry: 'Fashion',
    description: 'Elegant, high-fashion aesthetic with noir tones and premium finishes. Perfect for luxury and lifestyle brands.',
    icon: 'Gem',
    styles: ['minimal', 'glassmorphism', 'gradient'],
    preset: 'noir',
    suggestedColors: ['#000000', '#d4af37', '#f5f5f5'],
    backgroundSize: 'portrait',
    n: 2,
    quality: 'high',
  },
  {
    id: 'health-wellness',
    name: 'Health & Wellness',
    industry: 'Health',
    description: 'Calming, balanced designs with serene colors and organic flow. Ideal for medical, fitness, and wellness brands.',
    icon: 'Heart',
    styles: ['minimal', 'watercolor', 'gradient'],
    preset: 'zen',
    suggestedColors: ['#10b981', '#06b6d4', '#f0fdf4'],
    backgroundSize: 'landscape',
    n: 2,
    quality: 'high',
  },
  {
    id: 'gaming',
    name: 'Gaming & Esports',
    industry: 'Gaming',
    description: 'High-energy, electrifying visuals with neon accents and dynamic motion. Built for games and esports brands.',
    icon: 'Gamepad2',
    styles: ['neon', 'gradient', 'glassmorphism'],
    preset: 'electric',
    suggestedColors: ['#a855f7', '#06b6d4', '#ec4899'],
    backgroundSize: 'landscape',
    n: 3,
    quality: 'high',
  },
  {
    id: 'education',
    name: 'Education',
    industry: 'Education',
    description: 'Friendly, accessible designs with bright colors and clean layouts. Great for schools, courses, and edtech.',
    icon: 'GraduationCap',
    styles: ['clay', 'minimal', 'gradient'],
    preset: 'fresh',
    suggestedColors: ['#3b82f6', '#f59e0b', '#10b981'],
    backgroundSize: 'landscape',
    n: 2,
    quality: 'high',
  },
  {
    id: 'music-entertainment',
    name: 'Music & Entertainment',
    industry: 'Entertainment',
    description: 'Bold, vibrant aesthetic with retro-futuristic flair. Perfect for music labels, streaming, and media brands.',
    icon: 'Music',
    styles: ['retro', 'neon', 'gradient'],
    preset: 'electric',
    suggestedColors: ['#ef4444', '#8b5cf6', '#f97316'],
    backgroundSize: 'square',
    n: 2,
    quality: 'high',
  },
  {
    id: 'eco-sustainable',
    name: 'Eco & Sustainable',
    industry: 'Environment',
    description: 'Natural, earth-toned designs with organic watercolor textures. Ideal for green brands and sustainability projects.',
    icon: 'Leaf',
    styles: ['watercolor', 'minimal', 'clay'],
    preset: 'zen',
    suggestedColors: ['#16a34a', '#84cc16', '#713f12'],
    backgroundSize: 'landscape',
    n: 2,
    quality: 'high',
  },
  {
    id: 'vintage-craft',
    name: 'Vintage & Craft',
    industry: 'Craft',
    description: 'Nostalgic, handcrafted feel with warm retro tones and classic textures. Perfect for artisan and heritage brands.',
    icon: 'Scissors',
    styles: ['retro', 'watercolor', 'blueprint'],
    preset: 'vintage',
    suggestedColors: ['#92400e', '#b45309', '#fef3c7'],
    backgroundSize: 'square',
    n: 2,
    quality: 'high',
  },
  {
    id: 'minimal-modern',
    name: 'Minimal Modern',
    industry: 'General',
    description: 'Ultra-clean, contemporary aesthetic with pure minimalism. A universal choice for any modern brand.',
    icon: 'Minus',
    styles: ['minimal', 'glassmorphism'],
    preset: 'soft',
    suggestedColors: ['#18181b', '#71717a', '#fafafa'],
    backgroundSize: 'landscape',
    n: 2,
    quality: 'high',
  },
];

export function getTemplates(): BrandTemplate[] {
  return TEMPLATES;
}

export function getTemplate(id: string): BrandTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByIndustry(industry: string): BrandTemplate[] {
  return TEMPLATES.filter(
    (t) => t.industry.toLowerCase() === industry.toLowerCase()
  );
}

export function getIndustries(): string[] {
  return [...new Set(TEMPLATES.map((t) => t.industry))];
}
