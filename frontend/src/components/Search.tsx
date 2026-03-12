import { useState } from 'react';

interface SearchResult {
  name: string;
  url: string;
  snippet?: string;
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const doSearch = () => {
    if (!query) return;
    setLoading(true);
    setError(undefined);
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setResults(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  return (
    <div className="search">
      <input
        type="text"
        placeholder="Search web for tech blogs..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={doSearch} disabled={loading || !query.trim()}>
        Search
      </button>
      {loading && <p>Searching…</p>}
      {error && <p className="error">{error}</p>}
      <ul>
        {results.map((r, i) => (
          <li key={i}>
            <a href={r.url} target="_blank" rel="noopener noreferrer">
              {r.name}
            </a>
            {r.snippet && <p>{r.snippet}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
