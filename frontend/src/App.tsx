import React, { useState, useEffect } from 'react';
import './App.css';
import BlogList from './components/BlogList';
import Search from './components/Search';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';

// New Filter Component for Specializations
function FilterBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const specializations = ['Backend', 'Data', 'AI / Data/ML', 'Research', 'Mobile', 'Security', 'Web'];

  const handleFilter = (spec: string) => {
    const params = new URLSearchParams(location.search);
    params.set('spec', spec);
    // Maintain the current path (root or company) while adding the search filter
    navigate({ pathname: location.pathname, search: params.toString() });
  };

  const clearFilters = () => {
    navigate(location.pathname);
  };

  return (
    <div className="filter-bar">
      {specializations.map(spec => (
        <button key={spec} className="filter-btn" onClick={() => handleFilter(spec)}>
          {spec}
        </button>
      ))}
      <button className="filter-btn clear" onClick={clearFilters}>Clear Specialization</button>
    </div>
  );
}

function App() {
  const [sources, setSources] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/blogs')
      .then(r => r.ok ? r.json() : Promise.reject('fetch failed'))
      .then((data) => setSources(data))
      .catch(console.error);
  }, []);

  return (
    <BrowserRouter>
      <div className="App">
        <header className="navbar">
          <h1><Link to="/">BlogSpot</Link></h1>
          <Search />
          <nav className="company-nav">
            <button className="company-button">Companies ▾</button>
            <ul className="company-dropdown">
              {sources.map(s => (
                <li key={s.source} className="company-item">
                  <Link to={`/company/${encodeURIComponent(s.source)}`}>{s.source.split(' ')[0]}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <main>
          <FilterBar />
          <Routes>
            <Route path="/" element={<BlogList sources={sources} />} />
            <Route path="/company/:company" element={<BlogList sources={sources} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;