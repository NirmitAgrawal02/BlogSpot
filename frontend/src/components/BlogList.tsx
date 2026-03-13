import { useEffect, useState } from 'react';

export interface BlogPost {
  title: string;
  href: string;
}

export interface BlogSource {
  source: string;
  posts: BlogPost[];
}

export default function BlogList({ sources: initialSources }: { sources?: BlogSource[] }) {
  const [sources, setSources] = useState<BlogSource[]>(initialSources || []);
  const [loading, setLoading] = useState(!initialSources);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (initialSources) return; // data provided by caller
    const url = '/api/blogs';
    fetch(url)
      .then((r) => {
        if (!r.ok) {
          return r.text().then((text) => {
            throw new Error(`${url} returned ${r.status}${text ? ` - ${text}` : ''}`);
          });
        }
        return r.json();
      })
      .then((data: BlogSource[]) => {
        setSources(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [initialSources]);

  if (loading) return <p>Loading blog posts…</p>;
  if (error) return <p className="error">Failed to load: {error}</p>;

  interface PostCard {
    source: string;
    href: string;
    title: string;
    image?: string;
    categories?: string[];
  }

  // flatten all posts across sources into one list of cards
  const cards: PostCard[] = [];
  sources.forEach((s) => {
    (s.posts || []).forEach((p: any) => {
      cards.push({
        source: s.source,
        href: p.href,
        title: p.title,
        image: p.image,
        categories: p.categories,
      });
    });
  });

  return (
    <div className="blog-list">
      <div className="cards">
        {cards.map((c, idx) => (
          <div key={idx} className="blog-card">
            {c.image && (
              <div
                className="card-image"
                style={{ backgroundImage: `url(${c.image})` }}
              />
            )}
            <h3>{c.source}</h3>
            {c.categories && (
              <div className="categories">
                {c.categories.map((cat, i) => (
                  <span key={i} className="category-badge">
                    {cat}
                  </span>
                ))}
              </div>
            )}
            <a href={c.href} target="_blank" rel="noopener noreferrer">
              {c.title}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
