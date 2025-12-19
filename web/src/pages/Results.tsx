import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Results.css';

interface FileInfo {
  path: string;
  url: string;
}

interface ResultData {
  manifest: any;
  files: FileInfo[];
  outputDir: string;
}

interface CategoryFiles {
  backgrounds: FileInfo[];
  heroes: FileInfo[];
  icons: FileInfo[];
  social: FileInfo[];
}

export default function Results() {
  const { jobId } = useParams<{ jobId: string }>();
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<FileInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'backgrounds' | 'heroes' | 'icons' | 'social'>('all');

  useEffect(() => {
    if (!jobId) return;
    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}/result`);
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to load results');
        }
        const data = await response.json();
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

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePreview();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="results-page">
        <div className="loading">Loading results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-page">
        <div className="error-message">{error}</div>
        <Link to="/" className="back-link">
          Back to create
        </Link>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="results-page">
        <div className="error-message">No results found</div>
        <Link to="/" className="back-link">
          Back to create
        </Link>
      </div>
    );
  }

  const imageFiles = result.files.filter((f) =>
    /\.(png|jpg|jpeg|webp)$/i.test(f.path)
  );

  // Categorize files
  const categorized: CategoryFiles = {
    backgrounds: imageFiles.filter(f => f.path.includes('background')),
    heroes: imageFiles.filter(f => f.path.includes('hero')),
    icons: imageFiles.filter(f => f.path.includes('icons')),
    social: imageFiles.filter(f => f.path.includes('social')),
  };

  const getDisplayFiles = () => {
    switch (activeTab) {
      case 'backgrounds': return categorized.backgrounds;
      case 'heroes': return categorized.heroes;
      case 'icons': return categorized.icons;
      case 'social': return categorized.social;
      default: return imageFiles;
    }
  };

  const displayFiles = getDisplayFiles();
  const assetCount = imageFiles.length;

  return (
    <div className="results-page">
      {/* Preview Modal */}
      {previewImage && (
        <div className="preview-modal" onClick={closePreview}>
          <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="preview-close" onClick={closePreview}>×</button>
            <img src={previewImage.url} alt={previewImage.path} />
            <div className="preview-info">
              <span className="preview-path">{previewImage.path}</span>
              <a href={previewImage.url} download className="preview-download">
                Download
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="results-header">
        <div className="results-title">
          <h1>Brandkit generated!</h1>
          <div className="results-summary">
            <div className="summary-item">
              <span className="summary-label">Total</span>
              <span className="summary-value">{assetCount}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Backgrounds</span>
              <span className="summary-value">{categorized.backgrounds.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Heroes</span>
              <span className="summary-value">{categorized.heroes.length}</span>
            </div>
          </div>
        </div>
        <div className="results-actions">
          <button onClick={handleDownload} className="download-button">
            Download ZIP
          </button>
          <Link to="/" className="back-link">
            Create another
          </Link>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        <button
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All ({assetCount})
        </button>
        {categorized.backgrounds.length > 0 && (
          <button
            className={`tab-button ${activeTab === 'backgrounds' ? 'active' : ''}`}
            onClick={() => setActiveTab('backgrounds')}
          >
            Backgrounds ({categorized.backgrounds.length})
          </button>
        )}
        {categorized.heroes.length > 0 && (
          <button
            className={`tab-button ${activeTab === 'heroes' ? 'active' : ''}`}
            onClick={() => setActiveTab('heroes')}
          >
            Heroes ({categorized.heroes.length})
          </button>
        )}
        {categorized.icons.length > 0 && (
          <button
            className={`tab-button ${activeTab === 'icons' ? 'active' : ''}`}
            onClick={() => setActiveTab('icons')}
          >
            Icons ({categorized.icons.length})
          </button>
        )}
        {categorized.social.length > 0 && (
          <button
            className={`tab-button ${activeTab === 'social' ? 'active' : ''}`}
            onClick={() => setActiveTab('social')}
          >
            Social ({categorized.social.length})
          </button>
        )}
      </div>

      <div className="gallery-section">
        <div className="gallery-header">
          <h2>Preview</h2>
          <p className="gallery-hint">Click image to enlarge</p>
        </div>
        <div className="gallery-grid">
          {displayFiles.map((file, index) => (
            <div
              key={index}
              className="gallery-item"
              onClick={() => openPreview(file)}
            >
              <div className="gallery-item-image">
                <img src={file.url} alt={file.path} loading="lazy" />
                <div className="gallery-item-overlay">
                  <span className="zoom-icon">🔍</span>
                </div>
              </div>
              <div className="gallery-item-info">
                <div className="gallery-item-path">{file.path.split('/').pop()}</div>
                <a
                  href={file.url}
                  download
                  className="gallery-item-download"
                  onClick={(e) => e.stopPropagation()}
                >
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {result.manifest && (
        <details className="manifest-section">
          <summary>View Manifest (JSON)</summary>
          <pre className="manifest-json">
            {JSON.stringify(result.manifest, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
