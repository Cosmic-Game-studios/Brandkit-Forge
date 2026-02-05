import { Routes, Route, Link } from 'react-router-dom';
import { Hammer, Sparkles, Moon, Sun } from 'lucide-react';
import Create from './pages/Create';
import Results from './pages/Results';
import { useDarkMode } from './hooks/useDarkMode';

function App() {
  const [isDark, toggleDark] = useDarkMode();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-260px] right-[-220px] w-[520px] h-[520px] bg-brand-orange/10 rounded-full blur-[100px] pointer-events-none opacity-50" />
      <div className="absolute bottom-[-280px] left-[-200px] w-[520px] h-[520px] bg-brand-teal/10 rounded-full blur-[100px] pointer-events-none opacity-50" />

      <header className="sticky top-0 z-50 bg-[var(--surface)]/80 backdrop-blur-xl border-b border-[var(--border)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-brand-teal to-brand-orange p-2 rounded-xl shadow-md group-hover:scale-110 transition-transform">
              <Hammer className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-brand-teal to-brand-orange bg-clip-text text-transparent">
                Brandkit Forge
              </span>
              <span className="text-[10px] font-medium text-[var(--text-subtle)] -mt-1">v2.0</span>
            </div>
          </Link>

          <nav className="flex gap-2 items-center">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-[var(--text-muted)] hover:text-brand-teal hover:bg-brand-teal/5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Create
            </Link>

            <button
              onClick={toggleDark}
              className="flex items-center justify-center w-9 h-9 rounded-full text-[var(--text-muted)] hover:text-brand-teal hover:bg-brand-teal/5 transition-all"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 relative z-10">
        <Routes>
          <Route path="/" element={<Create />} />
          <Route path="/results/:jobId" element={<Results />} />
        </Routes>
      </main>

      <footer className="bg-[var(--surface)]/50 backdrop-blur-sm border-t border-[var(--border)] py-8 px-6 text-center text-sm text-[var(--text-subtle)]">
        <p>Brandkit Forge v2.0 &mdash; Cosmic Game Studios. Built for the OpenAI Dev Challenge.</p>
      </footer>
    </div>
  );
}

export default App;
