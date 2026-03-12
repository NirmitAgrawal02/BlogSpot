const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const sources = [
  { name: 'Uber Engineering', url: 'https://eng.uber.com/' },
  { name: 'Netflix Tech Blog', url: 'https://netflixtechblog.com/' },
  { name: 'LinkedIn Engineering', url: 'https://engineering.linkedin.com/blog' }
];

// simple scrapper: retrieves first few <a> tags with href from each page
async function scrapeSource(source) {
  try {
    const res = await axios.get(source.url);
    const $ = cheerio.load(res.data);

    // find links inside article headlines or h2/h3
    const links = [];
    $('a')
      .slice(0, 10)
      .each((i, el) => {
        const title = $(el).text().trim();
        const href = $(el).attr('href');
        if (title && href) {
          links.push({ title, href: href.startsWith('http') ? href : source.url + href });
        }
      });

    return { source: source.name, posts: links };
  } catch (err) {
    console.error('scrape error', source.name, err.message);
    return { source: source.name, posts: [] };
  }
}

app.get('/api/blogs', async (req, res) => {
  try {
    const results = await Promise.all(sources.map(scrapeSource));
    res.json(results);
  } catch (err) {
    console.error('unexpected /api/blogs error', err);
    res.status(500).json({ error: 'internal server error' });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'BlogSpot backend running. Use /api/blogs' });
});

// catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'not found', path: req.originalUrl });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`BlogSpot backend listening on port ${PORT}`);
});
