# BlogSpot
Creating a centralised system to read all the tech blogs.

## Overview
This repository contains a simple two‑tier application:

- `backend/` – Node/Express API that scrapes remote tech blogs on demand and returns a list of articles.
- `frontend/` – Vite‑powered React app that displays the aggregated links.

No database is used; the backend performs live HTTP fetches and parses the HTML.

## Getting Started

### Backend

```powershell
cd backend
npm install        # installs express, axios, cheerio, cors, nodemon
npm run dev        # start with hot reload (requires nodemon)
# or
npm start          # run production server on port 4000 by default
```

The API exposes a single endpoint:

`GET /api/blogs` – returns JSON with sources and scraped post titles/links.

### Frontend

Open a second terminal and run:

```powershell
cd frontend
npm install    # sets up React/Vite dependencies
npm run dev    # starts development server (http://localhost:5173)
```

The front end will call `/api/blogs` on the same host; if you run the backend on a different port adjust the `proxy` setting in `vite.config.ts` or use env variables.  

> ⚠️ On Windows the `localhost` name can resolve to an IPv6 address (`::1`) while the
> Flask server listens only on IPv4. If you see `ECONNREFUSED ::1:4000` in the Vite
> console, change the proxy `target` to `http://127.0.0.1:4000` (this repo already does
> that) or start Flask with `host='::'` so it accepts IPv6 connections.

### Development Notes

- To add additional tech blog sources, edit the backend code (`backend/app.py` for Python or `backend/server.js` for Node) and add entries to the `sources` array.
- The scraping logic is intentionally simple; you may need to tailor selectors for each site.

### Web search

The backend includes a `/api/search?q=…` endpoint that delegates to an external search
API (Bing by default). The React UI provides a search box at the top of the page;
enter a term such as "tech blog" or "Netflix engineering" to query the entire web
for relevant articles. You will need to supply an API key via the `BING_API_KEY`
environment variable on the server.

Feel free to extend with caching, search, authentication, etc.

