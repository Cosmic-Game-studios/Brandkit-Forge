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

export default function Results() {
  const { jobId } = useParams<{ jobId: string }>();
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const assetCount = imageFiles.length;

  return (
    <div className="results-page">
      <div className="results-header">
        <div className="results-title">
          <h1>Brandkit generated successfully!</h1>
          <div className="results-summary">
            <div className="summary-item">
              <span className="summary-label">Assets</span>
              <span className="summary-value">{assetCount}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Output</span>
              <span className="summary-value">{result.outputDir}</span>
            </div>
          </div>
        </div>
        <div className="results-actions">
          <button onClick={handleDownload} className="download-button">
            Download ZIP
          </button>
          <Link to="/" className="back-link">
            Create another brandkit
          </Link>
        </div>
      </div>

      {result.manifest && (
        <div className="manifest-section">
          <h2>Manifest</h2>
          <pre className="manifest-json">
            {JSON.stringify(result.manifest, null, 2)}
          </pre>
        </div>
      )}

      <div className="gallery-section">
        <h2>Generated assets ({assetCount})</h2>
        <div className="gallery-grid">
          {imageFiles.map((file, index) => (
            <div key={index} className="gallery-item">
              <img src={file.url} alt={file.path} loading="lazy" />
              <div className="gallery-item-info">
                <div className="gallery-item-path">{file.path}</div>
                <a href={file.url} download className="gallery-item-download">
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
