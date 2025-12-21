import { CheckCircle2, Palette, Settings2, Type } from 'lucide-react';
import type { StepId } from '../types';

const STEPS = [
  { id: 'IDENTITY' as const, title: 'Identity', icon: Type },
  { id: 'AESTHETICS' as const, title: 'Aesthetics', icon: Palette },
  { id: 'CONFIGURATION' as const, title: 'Configuration', icon: Settings2 },
];

export function Stepper({ currentStep }: { currentStep: StepId }) {
  const currentIndex = STEPS.findIndex((step) => step.id === currentStep);

  return (
    <div className="flex justify-between items-center mb-12 relative">
      {/* Progress Line */}
      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 rounded-full -translate-y-1/2 z-0" />
      <div
        className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-brand-teal to-teal-600 rounded-full -translate-y-1/2 z-0 transition-all duration-500 ease-out"
        style={{
          width: `${(currentIndex / (STEPS.length - 1)) * 100}%`,
        }}
      />

      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const isActive = currentStep === s.id;
        const isCompleted = currentIndex > i;

        return (
          <div key={s.id} className="relative z-10 flex flex-col items-center gap-3 flex-1">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg transform ${
                isActive
                  ? 'bg-gradient-to-br from-brand-teal to-teal-600 text-white ring-4 ring-brand-teal/20 scale-110 shadow-xl shadow-brand-teal/30'
                  : isCompleted
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white scale-100 shadow-md'
                    : 'bg-white border-2 border-gray-300 text-gray-400 scale-100'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : (
                <Icon className={`w-6 h-6 ${isActive ? 'text-white' : ''}`} />
              )}
            </div>
            <div className="text-center">
              <span
                className={`text-xs font-bold uppercase tracking-wider block ${
                  isActive 
                    ? 'text-brand-teal' 
                    : isCompleted 
                      ? 'text-green-600' 
                      : 'text-gray-400'
                }`}
              >
                {s.title}
              </span>
              {isActive && (
                <span className="text-[10px] text-gray-500 mt-0.5 block">
                  Step {i + 1} of {STEPS.length}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
