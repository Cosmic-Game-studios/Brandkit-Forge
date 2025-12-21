import type { CostEstimate } from '../../types';

export type StepId = 'IDENTITY' | 'AESTHETICS' | 'CONFIGURATION';

export type EditingCustomStyle = { 
  name: string; 
  chips: string[];
  chipOrder?: string[]; // For drag-and-drop ordering
};

export type EditingCustomPreset = {
  id: string;
  name: string;
  description: string;
  backgroundChips: string[];
  editChips: string[];
  backgroundChipOrder?: string[]; // For drag-and-drop ordering
  editChipOrder?: string[]; // For drag-and-drop ordering
};

export type DemoPromptEntry = { type: string; style: string; prompt: string };

export type CostInfo = {
  totalCost: number;
  apiCalls: number;
  breakdown: { backgrounds: number; heroes: number };
};

export type EstimatedCost = CostEstimate;

