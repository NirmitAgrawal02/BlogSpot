# BlogSpot Backend

The backend may be implemented using **Python/Flask** (recommended) or the previous
Node/Express server (`server.js`). Python makes scraping easier with
`requests` and `BeautifulSoup`.

## Python version

### Dependencies

```powershell
cd backend
python -m venv venv        # create virtual environment
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

### Running

```powershell
set BING_API_KEY=<your-key>   # optional, required for /api/search
python app.py
```

The Flask app listens on port 4000 by default. Set the `PORT` env var to change it.

### Endpoints

- `GET /api/blogs` — returns scraped links from a handful of sources.
- `GET /api/search?q=term` — uses Bing Web Search API to look for blogs/tech
  posts across the web; requires `BING_API_KEY`.

### Extending sources

Modify the `sources` list at the top of `app.py` and adjust the scraping
logic inside `scrape_source`. You can also implement custom scraping routines
per site.

## Node/Express fallback

A minimal Node implementation remains in `server.js` for reference; it's
built with `axios`/`cheerio` and provides just `/api/blogs`. Feel free to
delete it once you're comfortable with the Python version.

## Notes on AI-powered search

The `/api/search` endpoint shown above is a simple example; you can replace
it with any AI or search-provider logic. For instance, an LLM could generate
query variations, filter domain lists, or summarise results before returning
them to the front end.
