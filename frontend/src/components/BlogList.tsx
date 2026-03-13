import { useParams, useLocation } from 'react-router-dom';

export default function BlogList({ sources }: { sources: BlogSource[] }) {
  const { company } = useParams<{ company: string }>();
  const location = useLocation();
  const specFilter = new URLSearchParams(location.search).get('spec');

  const filteredCards: any[] = [];

  sources.forEach((s) => {
    // FIX: Only process the specific company if the URL param exists
    if (company && encodeURIComponent(s.source) !== company) return;

    (s.posts || []).forEach((p: any) => {
      // FIX: Further filter by specialization if selected
      if (specFilter && !p.categories?.includes(specFilter)) return;

      filteredCards.push({
        source: s.source,
        ...p,
      });
    });
  });

  if (sources.length === 0) return <div className="loading">Fetching the latest tech blogs...</div>;
  if (filteredCards.length === 0) return <div className="empty">No articles found matching your criteria.</div>;

  return (
    <div className="blog-list">
      <div className="cards">
        {filteredCards.map((c, idx) => (
          <div key={idx} className="blog-card">
            {/* Display the featured image found by the scraper */}
            <div 
              className="card-image" 
              style={{ backgroundImage: `url(${c.image || '/fallback-blog-image.jpg'})` }} 
            />
            <div className="card-content">
              <h3>{c.source}</h3>
              <div className="categories">
                {c.categories?.map((cat: string) => (
                  <span key={cat} className="category-badge">{cat}</span>
                ))}
              </div>
              <a href={c.href} target="_blank" rel="noopener noreferrer">{c.title}</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}