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

- `GET /` — simple health/landing route. Returns a JSON message so visiting the
  base URL does not produce a confusing "Not Found" page.
- `GET /api/blogs` — returns scraped links from a handful of sources. An array of
  objects with `source` and `posts` is returned; if a particular source fails the
  object may also contain an `error` string describing the problem. Backend errors
  are logged to the console. A failure to scrape one site does not cause a 500
  response; only unexpected exceptions propagate as status 500.
- `GET /api/search?q=term` — uses Bing Web Search API to look for blogs/tech
  posts across the web; requires `BING_API_KEY`. Errors from the search
  provider are also returned as JSON.

All undefined routes now return a JSON 404 response instead of HTML.

### Scraping caveats

- Some blogs reject non‑browser user agents (Uber returned 406). We now set a
  common Chrome UA string to work around that.
- SSL certificate verification may fail (Netflix). The scraper will retry once
  with `verify=False` and log a warning; you can install proper CA bundles if you
  prefer not to bypass verification.
- If scraping still fails, the `posts` array will be empty and an `error` field
  will describe the failure.

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
