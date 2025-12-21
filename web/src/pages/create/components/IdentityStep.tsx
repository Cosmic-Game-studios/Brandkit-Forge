import { useRef, useState } from 'react';
import { ChevronRight, Type, Upload, Image as ImageIcon } from 'lucide-react';

interface IdentityStepProps {
  logoPreview: string | null;
  logoFile: File | null;
  name: string;
  tagline: string;
  onChangeName: (value: string) => void;
  onChangeTagline: (value: string) => void;
  onFileSelect: (file: File) => void;
  onNext: () => void;
}

export function IdentityStep({
  logoPreview,
  logoFile,
  name,
  tagline,
  onChangeName,
  onChangeTagline,
  onFileSelect,
  onNext,
}: IdentityStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-brand-teal to-teal-600 rounded-xl shadow-lg">
            <Type className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Brand Identity</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              Tell us about your brand and upload your logo
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Logo Upload */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-brand-teal" />
            Upload Logo *
          </label>
          <div
            className={`relative group cursor-pointer transition-all duration-300 ${
              isDragging ? 'scale-[0.98]' : ''
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div
              className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all backdrop-blur-sm ${
                logoPreview
                  ? 'border-brand-teal bg-gradient-to-br from-brand-teal/10 to-teal-50 shadow-lg shadow-brand-teal/20'
                  : 'border-gray-300 bg-gradient-to-br from-gray-50 to-white group-hover:bg-gray-100 group-hover:border-brand-teal/50 group-hover:shadow-md'
              } ${isDragging ? 'border-brand-teal bg-brand-teal/20 scale-[0.98]' : ''}`}
            >
              {logoPreview ? (
                <div className="relative w-full h-full p-8 flex items-center justify-center">
                  <img
                    src={logoPreview}
                    alt="Logo Preview"
                    className="max-h-full max-w-full object-contain drop-shadow-xl"
                  />
                  <div className="absolute inset-0 bg-brand-teal/0 group-hover:bg-brand-teal/10 transition-all rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-sm">
                    <span className="text-brand-teal font-bold bg-white px-5 py-2.5 rounded-full shadow-lg text-sm transform group-hover:scale-110 transition-transform">
                      Change Logo
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-teal to-teal-600 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="font-bold text-gray-700 text-base">
                      Click to select or drag & drop
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG, JPG or WebP (Recommended: PNG with transparency)
                    </p>
                  </div>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileSelect(file);
              }}
            />
          </div>
        </div>

        {/* Name & Tagline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Type className="w-4 h-4 text-brand-teal" />
              Brand Name *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => onChangeName(e.target.value)}
              placeholder="e.g. Side Quest"
              className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-brand-teal/20 focus:border-brand-teal outline-none transition-all bg-white/50 backdrop-blur-sm hover:bg-white"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="tagline" className="text-sm font-bold text-gray-700">
              Tagline (Optional)
            </label>
            <input
              id="tagline"
              type="text"
              value={tagline}
              onChange={(e) => onChangeTagline(e.target.value)}
              placeholder="e.g. Go outside. Level up."
              className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:ring-4 focus:ring-brand-teal/20 focus:border-brand-teal outline-none transition-all bg-white/50 backdrop-blur-sm hover:bg-white"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={onNext}
          disabled={!logoFile || !name.trim()}
          className="flex items-center gap-2 bg-gradient-to-r from-brand-teal to-teal-600 text-white px-8 py-3.5 rounded-xl font-bold hover:from-teal-600 hover:to-brand-teal disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-teal/30 hover:shadow-xl hover:shadow-brand-teal/40 transform hover:scale-105 active:scale-95 disabled:transform-none"
        >
          Continue to Aesthetics
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
