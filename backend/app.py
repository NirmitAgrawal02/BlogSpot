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
    headers = {
        # mimic a normal browser to avoid 406/403
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                      'AppleWebKit/537.36 (KHTML, like Gecko) '
                      'Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    }

    try:
        r = requests.get(source['url'], headers=headers, timeout=10)
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
    except requests.exceptions.SSLError as ssl_err:
        # retry once ignoring certificate problems
        app.logger.warning('ssl error %s, retrying without verify', source['name'])
        try:
            r = requests.get(source['url'], headers=headers, timeout=10, verify=False)
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
        except Exception as e2:
            app.logger.warning('scrape error %s %s', source['name'], e2, exc_info=True)
            return {'source': source['name'], 'posts': [], 'error': str(e2)}
    except Exception as e:
        app.logger.warning('scrape error %s %s', source['name'], e, exc_info=True)
        return {'source': source['name'], 'posts': [], 'error': str(e)}


@app.before_request
def log_request_info():
    app.logger.debug('incoming request: %s %s', request.method, request.path)


@app.route('/api/blogs')
def blogs():
    # build results one source at a time to avoid a single failure crashing
    results = []
    for s in sources:
        try:
            results.append(scrape_source(s))
        except Exception as source_err:
            # this should never happen since scrape_source handles exceptions,
            # but we include a fallback just in case
            app.logger.error('scrape_source crashed for %s: %s', s.get('name'), source_err, exc_info=True)
            results.append({'source': s.get('name', '<unknown>'), 'posts': [], 'error': str(source_err)})
    # if any internal error occurred earlier it would have been caught above;
    # we still guard the jsonify call just in case.
    try:
        return jsonify(results)
    except Exception as e:

        app.logger.error('jsonify failed in /api/blogs: %s', e, exc_info=True)
        # return whatever we can; show debug info to aid diagnosis
        return jsonify({'error': 'json serialization failure', 'detail': str(e)}), 500


@app.route('/')
def index():
    # simple root path so visiting the server doesn't give a 404 page
    return jsonify({'message': 'BlogSpot backend is running. Use /api/blogs or /api/search'}), 200


# return JSON for all other undefined routes instead of the default HTML 404
@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'not found', 'path': request.path}), 404


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
