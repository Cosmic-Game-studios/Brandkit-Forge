import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  Download, 
  ChevronLeft, 
  ExternalLink, 
  Image as ImageIcon, 
  Grid, 
  Layout, 
  Maximize2, 
  X,
  FileJson,
  CheckCircle2
} from 'lucide-react';
import type { FileInfo, JobResult } from '../types';

type AssetCategory = 'all' | 'backgrounds' | 'heroes' | 'icons' | 'social';

interface CategoryFiles {
  backgrounds: FileInfo[];
  heroes: FileInfo[];
  icons: FileInfo[];
  social: FileInfo[];
}

const IMAGE_PATTERN = /\.(png|jpg|jpeg|webp)$/i;

function categorizeFiles(files: FileInfo[]): CategoryFiles {
  return {
    backgrounds: files.filter((file) => file.path.includes('background')),
    heroes: files.filter((file) => file.path.includes('hero')),
    icons: files.filter((file) => file.path.includes('icons')),
    social: files.filter((file) => file.path.includes('social')),
  };
}

function getDisplayFiles(
  category: AssetCategory,
  files: FileInfo[],
  categorized: CategoryFiles
): FileInfo[] {
  switch (category) {
    case 'backgrounds':
      return categorized.backgrounds;
    case 'heroes':
      return categorized.heroes;
    case 'icons':
      return categorized.icons;
    case 'social':
      return categorized.social;
    default:
      return files;
  }
}

export default function Results() {
  const { jobId } = useParams<{ jobId: string }>();
  const [result, setResult] = useState<JobResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<FileInfo | null>(null);
  const [activeTab, setActiveTab] = useState<AssetCategory>('all');

  useEffect(() => {
    if (!jobId) return;
    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}/result`);
        if (!response.ok) {
          const payload = await response.json();
          throw new Error(payload.error || 'Failed to load results');
        }
        const data = (await response.json()) as JobResult;
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [jobId]);

  const handleDownload = () => {
    if (jobId) {
      window.location.href = `/api/jobs/${jobId}/download`;
    }
  };

  const openPreview = (file: FileInfo) => {
    setPreviewImage(file);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePreview();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const imageFiles = useMemo(() => {
    return result?.files.filter((file) => IMAGE_PATTERN.test(file.path)) ?? [];
  }, [result]);

  const categorized = useMemo(() => categorizeFiles(imageFiles), [imageFiles]);

  const displayFiles = useMemo(() => {
    return getDisplayFiles(activeTab, imageFiles, categorized);
  }, [activeTab, categorized, imageFiles]);

  const assetCount = imageFiles.length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-12 pb-20">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-gray-200/50 border-2 border-white/20 text-center">
          <div className="text-lg text-gray-600">Loading results...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-12 pb-20">
        <div className="bg-red-50/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-gray-200/50 border-2 border-red-100/50">
          <div className="text-lg text-red-700 font-semibold mb-4">{error}</div>
          <Link 
            to="/" 
            className="text-brand-teal hover:text-brand-teal/80 font-semibold transition-colors"
          >
            ← Back to create
          </Link>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-7xl mx-auto space-y-12 pb-20">
        <div className="bg-yellow-50/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-gray-200/50 border-2 border-yellow-100/50">
          <div className="text-lg text-yellow-700 font-semibold mb-4">No results found</div>
          <Link 
            to="/" 
            className="text-brand-teal hover:text-brand-teal/80 font-semibold transition-colors"
          >
            ← Back to create
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] bg-gray-900/95 backdrop-blur-md flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300"
          onClick={closePreview}
        >
          <button 
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all group"
            onClick={closePreview}
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          </button>
          
          <div 
            className="relative max-w-full max-h-full group"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={previewImage.url} 
              alt={previewImage.path} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
              <span className="text-white/80 text-xs font-mono truncate max-w-[200px]">
                {previewImage.path.split('/').pop()}
              </span>
              <div className="w-px h-4 bg-white/20" />
              <a 
                href={previewImage.url} 
                download 
                className="flex items-center gap-2 text-white font-bold text-sm hover:text-brand-orange transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 p-2 rounded-xl shadow-lg shadow-green-500/20">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Brandkit Forged!</h1>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {[
              { label: 'Total', value: assetCount, icon: Grid },
              { label: 'Backgrounds', value: categorized.backgrounds.length, icon: ImageIcon },
              { label: 'Heroes', value: categorized.heroes.length, icon: Layout },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
                <item.icon className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-bold text-gray-900">{item.value}</span>
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button 
            onClick={handleDownload} 
            className="flex items-center justify-center gap-2 bg-brand-teal text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl hover:shadow-brand-teal/20 transition-all group"
          >
            <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
            Download All as ZIP
          </button>
          <Link 
            to="/" 
            className="flex items-center justify-center gap-2 bg-white text-gray-600 border border-gray-200 px-8 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
            New Project
          </Link>
        </div>
      </div>

      {/* Tabs & Gallery */}
      <div className="space-y-8 animate-in fade-in duration-700 delay-200">
        <div className="flex items-center gap-2 p-1.5 bg-white border border-gray-100 rounded-2xl w-fit shadow-sm overflow-x-auto scrollbar-hide">
          {[
            { id: 'all', label: 'All', count: assetCount },
            { id: 'backgrounds', label: 'Backgrounds', count: categorized.backgrounds.length },
            { id: 'heroes', label: 'Heroes', count: categorized.heroes.length },
            { id: 'icons', label: 'Icons', count: categorized.icons.length },
            { id: 'social', label: 'Social', count: categorized.social.length },
          ].map((tab) => (
            tab.count > 0 && (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AssetCategory)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/10'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            )
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayFiles.map((file, index) => (
            <div
              key={index}
              className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div 
                className="aspect-[4/3] relative cursor-pointer overflow-hidden bg-gray-50"
                onClick={() => openPreview(file)}
              >
                <img 
                  src={file.url} 
                  alt={file.path} 
                  loading="lazy" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-brand-teal/0 group-hover:bg-brand-teal/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-300">
                    <Maximize2 className="w-5 h-5 text-brand-teal" />
                  </div>
                </div>
              </div>
              
              <div className="p-5 flex flex-col gap-4 flex-1">
                <div className="space-y-1 flex-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-teal/60">
                    {file.path.split('/')[0]}
                  </span>
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {file.path.split('/').pop()}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <a
                    href={file.url}
                    download
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-brand-teal transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                  <button 
                    onClick={() => openPreview(file)}
                    className="p-2 text-gray-300 hover:text-brand-teal hover:bg-brand-teal/5 rounded-lg transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manifest Section */}
      {result.manifest && (
        <div className="space-y-6 animate-in fade-in duration-700 delay-500">
          <div className="flex items-center gap-3">
            <FileJson className="w-6 h-6 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900">Project Manifest</h2>
          </div>
          <details className="group bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <summary className="px-8 py-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between list-none">
              <span className="text-sm font-bold text-gray-600">View Raw JSON</span>
              <ChevronLeft className="w-5 h-5 text-gray-400 -rotate-90 group-open:rotate-90 transition-transform" />
            </summary>
            <div className="p-8 bg-gray-900 border-t border-gray-100">
              <pre className="text-xs text-brand-teal/80 font-mono overflow-x-auto scrollbar-hide">
                {JSON.stringify(result.manifest, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
