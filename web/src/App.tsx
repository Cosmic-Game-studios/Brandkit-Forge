import { Routes, Route, Link } from 'react-router-dom';
import Create from './pages/Create';
import Results from './pages/Results';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="app-title">
          Brandkit Forge
        </Link>
        <nav>
          <Link to="/">Create</Link>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Create />} />
          <Route path="/results/:jobId" element={<Results />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
