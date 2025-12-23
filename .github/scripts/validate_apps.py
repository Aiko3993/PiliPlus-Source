import sys
import os
from utils import load_json, validate_repo_format, validate_url, logger

def validate_apps_json(file_path, global_seen_repos):
    logger.info(f"Validating {file_path}...")
    
    data = load_json(file_path)
    if not isinstance(data, list):
        logger.error("Root must be a list")
        return False

    success = True
    
    for idx, app in enumerate(data):
        # 1. Check Name
        name = app.get('name')
        if not name or not isinstance(name, str) or len(name) > 100:
            logger.error(f"Item {idx}: Invalid 'name' (must be string <= 100 chars)")
            success = False

        # 2. Check Repo
        repo = app.get('github_repo')
        valid_repo, msg = validate_repo_format(repo)
        if not valid_repo:
            logger.error(f"Item {idx}: {msg} ('{repo}')")
            success = False
        else:
            # Check for duplicate Repo + Name combination
            repo_name_key = (repo.lower(), name.lower())
            if repo_name_key in global_seen_repos:
                logger.error(f"Item {idx}: Duplicate entry for repo '{repo}' with name '{name}'")
                success = False
            else:
                global_seen_repos.add(repo_name_key)

        # 3. Check Icon URL
        icon_url = app.get('icon_url')
        valid_url, msg = validate_url(icon_url)
        if not valid_url:
            logger.error(f"Item {idx}: {msg} ('{icon_url}')")
            success = False
            
        # 4. Check Tint Color (Optional)
        tint = app.get('tint_color')
        if tint:
            if not isinstance(tint, str) or not tint.startswith('#') or len(tint) not in [4, 7]:
                logger.error(f"Item {idx}: Invalid tint_color '{tint}'")
                success = False

    if success:
        logger.info(f"✅ {file_path} is valid. ({len(data)} apps)")
    return success

def main():
    files_to_check = ['sources/standard/apps.json', 'sources/nsfw/apps.json']
    global_seen_repos = set()
    all_valid = True
    
    for file_path in files_to_check:
        if os.path.exists(file_path):
            if not validate_apps_json(file_path, global_seen_repos):
                all_valid = False
        else:
            logger.warning(f"File not found (skipping): {file_path}")
    
    if not all_valid:
        sys.exit(1)

if __name__ == "__main__":
    main()
