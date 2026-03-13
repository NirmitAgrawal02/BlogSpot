import React, { useState, useEffect } from 'react';
import './App.css';
import BlogList from './components/BlogList';
import Search from './components/Search';
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';

// page that shows blogs filtered by company name param
function CompanyPage({allSources}: {allSources: any[]}) {
  const { company } = useParams<{company: string}>();
  const source = allSources.find(s => encodeURIComponent(s.source) === company);
  if (!source) return <p>Company not found.</p>;
  const label = source.source.split(' ')[0];
  return (
    <div className="company-page">
      <h2>{label}</h2>
      <BlogList sources={[source]} />
    </div>
  );
}

function App() {
  const [sources, setSources] = useState<any[]>([]);

  // fetch once on mount and store sources for dropdown / filtering
  useEffect(() => {
    fetch('/api/blogs')
      .then(r => r.ok ? r.json() : Promise.reject('fetch failed'))
      .then((data) => setSources(data))
      .catch(console.error);
  }, []);

  // show all companies even if scraping produced zero posts
  const companyItems = sources.map(s => {
    const label = s.source.split(' ')[0];
    return (
      <li key={s.source} className="company-item">
        <Link to={`/company/${encodeURIComponent(s.source)}`}>{label}</Link>
      </li>
    );
  });

  return (
    <BrowserRouter>
      <div className="App">
        <header className="navbar">
          <h1><Link to="/">BlogSpot</Link></h1>
          <Search />
          <nav className="company-nav">
            <button className="company-button">Companies ▾</button>
            <ul className="company-dropdown">
              {companyItems}
            </ul>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<BlogList />} />
            <Route path="/company/:company" element={<CompanyPage allSources={sources} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App
