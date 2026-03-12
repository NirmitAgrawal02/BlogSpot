from flask import Flask, jsonify, request
import requests
from bs4 import BeautifulSoup
import os

app = Flask(__name__)

sources = [
    {"name": "Uber Engineering", "url": "https://eng.uber.com/"},
    {"name": "Netflix Tech Blog", "url": "https://netflixtechblog.com/"},
    {"name": "LinkedIn Engineering", "url": "https://engineering.linkedin.com/blog"},
]


def scrape_source(source):
    try:
        r = requests.get(source['url'], timeout=10)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, 'html.parser')
        links = []
        for a in soup.find_all('a', href=True)[:10]:
            title = a.get_text(strip=True)
            href = a['href']
            if title and href:
                if not href.startswith('http'):
                    href = source['url'].rstrip('/') + '/' + href.lstrip('/')
                links.append({'title': title, 'href': href})
        return {'source': source['name'], 'posts': links}
    except Exception as e:
        print('scrape error', source['name'], e)
        return {'source': source['name'], 'posts': []}


@app.route('/api/blogs')
def blogs():
    results = [scrape_source(s) for s in sources]
    return jsonify(results)


@app.route('/api/search')
def search():
    q = request.args.get('q')
    if not q:
        return jsonify({'error': 'missing query'}), 400
    key = os.environ.get('BING_API_KEY')
    if not key:
        return jsonify({'error': 'BING_API_KEY not set'}), 500
    url = 'https://api.bing.microsoft.com/v7.0/search'
    params = {'q': q, 'count': 10}
    headers = {'Ocp-Apim-Subscription-Key': key}
    r = requests.get(url, params=params, headers=headers, timeout=10)
    data = r.json()
    results = []
    for item in data.get('webPages', {}).get('value', []):
        results.append({
            'name': item.get('name'),
            'url': item.get('url'),
            'snippet': item.get('snippet'),
        })
    return jsonify(results)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 4000))
    app.run(host='0.0.0.0', port=port)
