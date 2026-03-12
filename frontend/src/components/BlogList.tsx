import { useEffect, useState } from 'react';

export interface BlogPost {
  title: string;
  href: string;
}

export interface BlogSource {
  source: string;
  posts: BlogPost[];
}

export default function BlogList() {
  const [sources, setSources] = useState<BlogSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    fetch('/api/blogs')
      .then((r) => {
        if (!r.ok) throw new Error(`status ${r.status}`);
        return r.json();
      })
      .then((data: BlogSource[]) => {
        setSources(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading blog posts…</p>;
  if (error) return <p className="error">Failed to load: {error}</p>;

  return (
    <div className="blog-list">
      {sources.map((s) => (
        <section key={s.source}>
          <h2>{s.source}</h2>
          <ul>
            {s.posts.map((p, i) => (
              <li key={i}>
                <a href={p.href} target="_blank" rel="noopener noreferrer">
                  {p.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
