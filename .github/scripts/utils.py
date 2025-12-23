import json
import os
import sys
import re
import tempfile
import logging
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)

# Constants
REPO_PATTERN = re.compile(r'^[a-zA-Z0-9\._-]+/[a-zA-Z0-9\._-]+$')
URL_PATTERN = re.compile(r'^https?://')

def load_json(path):
    """Load JSON file safely."""
    if not os.path.exists(path):
        logger.warning(f"File not found: {path}")
        return []
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        logger.error(f"Error decoding JSON {path}: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Error reading {path}: {e}")
        sys.exit(1)

def save_json(path, data):
    """Save JSON file atomically."""
    dir_path = os.path.dirname(path) or '.'
    os.makedirs(dir_path, exist_ok=True)
    
    try:
        with tempfile.NamedTemporaryFile('w', dir=dir_path, delete=False, encoding='utf-8') as tmp:
            json.dump(data, tmp, indent=2, ensure_ascii=False)
            tmp_path = tmp.name
        
        os.replace(tmp_path, path)
        logger.info(f"Saved {path}")
    except Exception as e:
        logger.error(f"Error saving {path}: {e}")
        if 'tmp_path' in locals() and os.path.exists(tmp_path):
            os.remove(tmp_path)
        sys.exit(1)

def validate_repo_format(repo):
    """Check if repo string matches Owner/Name format."""
    if not repo:
        return False, "Repo is empty"
    if len(repo) > 100:
        return False, "Repo name too long"
    if '..' in repo:
        return False, "Directory traversal detected"
    if not REPO_PATTERN.match(repo):
        return False, "Invalid format (expected Owner/Repo)"
    return True, ""

def validate_url(url):
    """Check if URL is valid and safe."""
    if not url or url.lower() in ['none', '_no response_', '']:
        return True, "" # Empty is considered "valid" but ignored
    
    if not URL_PATTERN.match(url):
        return False, "Must start with http:// or https://"
    
    # Basic SSRF check
    lower_url = url.lower()
    if 'localhost' in lower_url or '127.0.0.1' in lower_url or '::1' in lower_url:
        return False, "Localhost URLs not allowed"
        
    return True, ""

class GitHubClient:
    def __init__(self, token=None):
        self.session = requests.Session()
        retries = Retry(total=3, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])
        self.session.mount("https://", HTTPAdapter(max_retries=retries))
        self.token = token or os.environ.get('GITHUB_TOKEN')
        self.headers = {
            "Accept": "application/vnd.github+json",
            "User-Agent": "iOS-Sideload-Source-Updater"
        }
        if self.token:
            self.headers["Authorization"] = f"Bearer {self.token}"

    def get(self, url, timeout=15):
        try:
            response = self.session.get(url, headers=self.headers, timeout=timeout)
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {url} - {e}")
            return None

    def get_repo_info(self, repo):
        url = f"https://api.github.com/repos/{repo}"
        resp = self.get(url)
        return resp.json() if resp else None

    def get_latest_release(self, repo, prefer_pre_release=False, tag_regex=None):
        url = f"https://api.github.com/repos/{repo}/releases"
        resp = self.get(url)
        if not resp:
            return None
        
        releases = resp.json()
        if not isinstance(releases, list):
            return None

        active_releases = [r for r in releases if not r.get('draft', False)]
        if not active_releases:
            return None
            
        # Filter by tag regex if provided
        if tag_regex:
            try:
                pattern = re.compile(tag_regex, re.IGNORECASE)
                active_releases = [r for r in active_releases if pattern.search(r.get('tag_name', ''))]
            except Exception as e:
                logger.error(f"Invalid tag_regex '{tag_regex}': {e}")

        if not active_releases:
            return None

        # Filter based on preference
        stable = [r for r in active_releases if not r.get('prerelease', False)]
        pre = [r for r in active_releases if r.get('prerelease', False)]

        def get_date(r): return r.get('published_at') or ''

        if prefer_pre_release:
            sorted_pre = sorted(pre, key=get_date, reverse=True)
            sorted_stable = sorted(stable, key=get_date, reverse=True)
            
            if sorted_pre:
                if not sorted_stable or get_date(sorted_pre[0]) >= get_date(sorted_stable[0]):
                    return sorted_pre[0]
            
            return sorted_stable[0] if sorted_stable else (sorted_pre[0] if sorted_pre else None)
        else:
            if stable:
                return sorted(stable, key=get_date, reverse=True)[0]
            return sorted(active_releases, key=get_date, reverse=True)[0]

    def check_repo_exists(self, repo):
        url = f"https://api.github.com/repos/{repo}"
        try:
            response = self.session.head(url, headers=self.headers, timeout=5)
            return response.status_code == 200
        except:
            return False

    def get_repo_contents(self, repo, path=""):
        """Fetch contents of a path in the repo."""
        url = f"https://api.github.com/repos/{repo}/contents/{path}"
        resp = self.get(url)
        return resp.json() if resp else None

    def get_git_tree(self, repo, sha="HEAD", recursive=True):
        """Fetch the git tree of the repo."""
        recursive_param = "?recursive=1" if recursive else ""
        url = f"https://api.github.com/repos/{repo}/git/trees/{sha}{recursive_param}"
        resp = self.get(url)
        return resp.json() if resp else None

def normalize_name(s):
    """Normalize string for fuzzy comparison: lowercase and remove non-alphanumeric chars and common version suffixes."""
    if not s: return ""
    s = s.lower()
    # Remove common version/flavor suffixes from name before normalization
    s = re.sub(r'\s*\((nightly|beta|alpha|dev|pre-release|experimental|trollstore|jit|sideloading)\)', '', s)
    s = re.sub(r'-(nightly|beta|alpha|dev|pre-release|experimental|trollstore|jit|sideloading)', '', s)
    return re.sub(r'[^a-z0-9]', '', s)

def score_icon_path(path):
    """Score a path or URL for its quality as an icon."""
    p = path.lower()
    score = 0
    
    # Critical folders/patterns
    if 'appicon.appiconset' in p: score += 100
    elif 'ios/' in p: score += 50
    elif 'assets/' in p: score += 20
    elif 'public/' in p: score += 10
    
    # Filenames
    name = os.path.basename(p)
    if 'icon' in name: score += 30
    elif 'logo' in name: score += 25
    elif 'app' in name: score += 10
    
    # Square/Resolution preference
    if 'square' in name: score += 20
    if '1024' in name: score += 20
    elif '512' in name: score += 15
    elif '256' in name: score += 10
    elif '120' in name: score += 5
    
    # Penalties for things that are likely NOT the main app icon or are pre-masked
    if 'android' in p: score -= 60
    if 'small' in name: score -= 20
    if 'toolbar' in name: score -= 30
    if 'preview' in name: score -= 40
    if 'mask' in name: score -= 30
    if 'rounded' in name: score -= 20
    if 'notification' in name: score -= 50
    if 'tabbar' in name: score -= 40
    
    # URL reliability
    if 'raw.githubusercontent.com' in p: score += 20
    elif 'github.com' in p and '/raw/' in p: score += 15
    
    return score

def find_best_icon(repo, client, limit=5):
    """
    Auto-detect the best app icon candidates from the GitHub repository.
    Returns a list of raw URLs sorted by score.
    """
    logger.info(f"Searching for icon candidates in {repo}...")
    
    # 1. Try fetching the full git tree (recursive)
    try:
        tree_data = client.get_git_tree(repo, recursive=True)
    except Exception as e:
        logger.warning(f"Failed to fetch git tree for {repo}: {e}")
        tree_data = None

    if not tree_data or 'tree' not in tree_data:
        try:
            root_contents = client.get_repo_contents(repo)
            if root_contents and isinstance(root_contents, list):
                tree_data = {'tree': [{'path': c['name'], 'type': 'blob' if c['type']=='file' else 'tree'} for c in root_contents]}
            else:
                return []
        except:
            return []

    candidates = []
    valid_exts = ('.png', '.jpg', '.jpeg', '.webp', '.svg')
    
    for item in tree_data['tree']:
        path = item['path']
        if path.lower().endswith(valid_exts):
            s = score_icon_path(path)
            if s > 0:
                candidates.append((s, path))
    
    if not candidates:
        try:
            repo_info = client.get_repo_info(repo)
            if repo_info and 'owner' in repo_info:
                return [repo_info['owner']['avatar_url']]
        except:
            pass
        return []

    candidates.sort(key=lambda x: x[0], reverse=True)
    
    repo_info = client.get_repo_info(repo)
    if not repo_info: return []
    default_branch = repo_info.get('default_branch', 'main')
    
    top_urls = []
    for s, path in candidates[:limit]:
        raw_url = f"https://raw.githubusercontent.com/{repo}/{default_branch}/{path}"
        top_urls.append(raw_url)
        
    return top_urls
