import json
import os
import sys
import argparse
from utils import load_json, save_json, validate_repo_format, validate_url, logger, GitHubClient

def process_single_app(app_data, client=None):
    """Process a single app dictionary. Returns result dict."""
    app_name = (app_data.get('name') or '').strip()
    repo_input = (app_data.get('repo') or '').strip()
    category = (app_data.get('category') or '').strip()
    icon_url = (app_data.get('icon_url') or '').strip()

    # Handle full GitHub URLs
    if repo_input.startswith("https://github.com/"):
        repo = repo_input.replace("https://github.com/", "").strip("/")
    else:
        repo = repo_input

    # 1. Basic Validation
    valid_repo, msg = validate_repo_format(repo)
    if not valid_repo:
        return {'status': 'error', 'message': f'Invalid repo: {msg}', 'repo': repo}

    # 2. Check existence on GitHub (if client available)
    if client:
        if not client.check_repo_exists(repo):
            return {'status': 'error', 'message': f'Repository {repo} not found on GitHub', 'repo': repo}

    # Sanitize App Name
    app_name = ''.join(c for c in app_name if c.isprintable())
    
    # Paths
    standard_path = 'sources/standard/apps.json'
    nsfw_path = 'sources/nsfw/apps.json'
    
    target_path = standard_path if category == 'Standard' else nsfw_path
    other_path = nsfw_path if category == 'Standard' else standard_path

    # Check/Move from other list
    if os.path.exists(other_path):
        other_data = load_json(other_path)
        new_other_data = [app for app in other_data if app.get('github_repo', '').lower() != repo.lower()]
        if len(new_other_data) < len(other_data):
            logger.info(f"Moving {repo} from {other_path} to {target_path}...")
            save_json(other_path, new_other_data)

    # Load Target
    data = load_json(target_path)
    
    # Check if exists
    # Matching strategy: Same repo AND same name to support flavors/versions
    existing_entry = next((item for item in data 
                          if item.get('github_repo', '').lower() == repo.lower() 
                          and item.get('name', '').lower() == app_name.lower()), None)
    
    status = ""
    message = ""

    valid_icon, icon_msg = validate_url(icon_url)
    if not valid_icon:
        logger.warning(f"Invalid icon URL for {repo}: {icon_msg}")
        icon_url = "" 
    
    # Auto-detect pre-release/tag filters from name
    pre_release = False
    tag_regex = None
    
    name_lower = app_name.lower()
    if any(kw in name_lower for kw in ['nightly', 'beta', 'alpha', 'dev', 'pre-release', 'experimental']):
        pre_release = True
        # If "nightly" is specifically mentioned, add a tag filter for it
        if 'nightly' in name_lower:
            tag_regex = 'nightly'
        elif 'beta' in name_lower:
            tag_regex = 'beta'

    if existing_entry:
        logger.info(f"Updating existing entry for {repo} ({app_name})")
        existing_entry['name'] = app_name
        if icon_url:
            existing_entry['icon_url'] = icon_url
            logger.info(f"Updated icon_url to {icon_url}")
        
        # Update flags if they weren't manually overridden (or just keep them synced)
        existing_entry['pre_release'] = pre_release
        if tag_regex:
            existing_entry['tag_regex'] = tag_regex
            
        status = "updated"
        message = f"Updated details in {category}"
    else:
        logger.info(f"Adding new entry for {repo} ({app_name})")
        new_entry = {
            'name': app_name,
            'github_repo': repo,
            'pre_release': pre_release
        }
        if tag_regex:
            new_entry['tag_regex'] = tag_regex
        if icon_url:
            new_entry['icon_url'] = icon_url
            logger.info(f"Set icon_url to {icon_url}")
            
        data.append(new_entry)
        status = "added"
        message = f"Added to {category}"

    save_json(target_path, data)
    return {'status': status, 'message': message, 'repo': repo}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--remove', action='store_true', help='Remove the app')
    args = parser.parse_args()

    # REMOVE MODE (Single repo via Env)
    if args.remove:
        repo = os.environ.get('REPO', '').strip()
        if not repo:
            logger.error("REPO env var required for remove")
            sys.exit(1)
            
        logger.info(f"Processing removal for: {repo}")
        removed = False
        paths = ['sources/standard/apps.json', 'sources/nsfw/apps.json']
        
        for path in paths:
            if not os.path.exists(path): continue
            data = load_json(path)
            initial_len = len(data)
            new_data = [app for app in data if app.get('github_repo', '').lower() != repo.lower()]
            
            if len(new_data) < initial_len:
                save_json(path, new_data)
                logger.info(f"Removed from {path}")
                removed = True
        
        with open(os.environ['GITHUB_OUTPUT'], 'a') as fh:
            fh.write(f'removed={str(removed).lower()}\n')
        sys.exit(0)

    # BATCH ADD/UPDATE MODE
    apps_json = os.environ.get('APPS_JSON', '[]')
    try:
        apps_list = json.loads(apps_json)
    except:
        logger.error("Invalid JSON in APPS_JSON")
        sys.exit(1)

    if not apps_list:
        logger.info("No apps to process.")
        sys.exit(0)

    # Initialize GitHub Client if token is available
    client = GitHubClient() if os.environ.get('GITHUB_TOKEN') else None

    results = []
    for app_data in apps_list:
        try:
            res = process_single_app(app_data, client)
            results.append(res)
        except Exception as e:
            logger.error(f"Error processing {app_data}: {e}")
            results.append({'status': 'error', 'message': str(e), 'repo': app_data.get('repo', 'unknown')})

    # Output results for comment
    with open(os.environ['GITHUB_OUTPUT'], 'a') as fh:
        fh.write(f'results={json.dumps(results)}\n')
        # Also output action for the first result to support commit message
        if results:
            fh.write(f'action={results[0]["status"]}\n')

if __name__ == "__main__":
    main()
