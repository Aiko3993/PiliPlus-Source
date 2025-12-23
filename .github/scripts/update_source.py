import json
import zipfile
import plistlib
import os
import hashlib
import tempfile
import shutil
import re
from datetime import datetime
from PIL import Image
from io import BytesIO

from utils import load_json, save_json, logger, GitHubClient, find_best_icon, score_icon_path, normalize_name

def get_ipa_metadata(ipa_path, default_bundle_id):
    """Extract version, build number, and bundle ID from IPA content."""
    try:
        with zipfile.ZipFile(ipa_path, 'r') as ipa:
            info_plist_path = None
            pattern = re.compile(r'^Payload/[^/]+\.app/Info\.plist$', re.IGNORECASE)
            
            for name in ipa.namelist():
                if pattern.match(name):
                    info_plist_path = name
                    break
            
            if not info_plist_path:
                return None, None, None

            with ipa.open(info_plist_path) as plist_file:
                plist = plistlib.load(plist_file)
                
            version = plist.get('CFBundleShortVersionString', '0.0.0')
            build = plist.get('CFBundleVersion', '0')
            bundle_id = plist.get('CFBundleIdentifier', default_bundle_id)
            
            return version, build, bundle_id
    except Exception as e:
        logger.error(f"Error parsing IPA: {e}")
        return None, None, None

def get_ipa_sha256(ipa_path):
    """Calculate SHA256 hash of IPA file."""
    sha256_hash = hashlib.sha256()
    with open(ipa_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def extract_dominant_color(image_url, client):
    """Extract dominant color from image URL."""
    if not image_url or not image_url.startswith(('http://', 'https://')):
        return None

    try:
        response = client.get(image_url, timeout=10)
        if not response: return None
        
        img = Image.open(BytesIO(response.content))
        img = img.convert("RGBA")
        img = img.resize((100, 100))
        
        colors = img.getcolors(10000)
        if not colors:
            return None

        max_count = 0
        dominant = (0, 0, 0)
        
        for count, color in colors:
            if len(color) == 4 and color[3] < 10:
                continue
            r, g, b = color[:3]
            if r > 240 and g > 240 and b > 240: continue # White
            if r < 15 and g < 15 and b < 15: continue # Black
            
            if count > max_count:
                max_count = count
                dominant = color[:3]
                
        return '#{:02x}{:02x}{:02x}'.format(*dominant).upper()
    except Exception as e:
        logger.warning(f"Could not extract color from {image_url}: {e}")
        return None

def load_existing_source(source_file, default_name, default_identifier):
    if os.path.exists(source_file):
        try:
            return load_json(source_file)
        except:
            pass # fallback
    return {
        "name": default_name,
        "identifier": default_identifier,
        "apps": [],
        "news": []
    }

def select_best_ipa(assets, app_config):
    """Select the most appropriate IPA asset based on config and heuristics."""
    ipa_assets = [a for a in assets if a.get('name', '').lower().endswith('.ipa')]
    if not ipa_assets:
        return None
        
    if len(ipa_assets) == 1:
        return ipa_assets[0]
        
    # 1. Regex Match (User Override)
    ipa_regex = app_config.get('ipa_regex')
    if ipa_regex:
        try:
            pattern = re.compile(ipa_regex, re.IGNORECASE)
            for a in ipa_assets:
                if pattern.search(a['name']):
                    return a
        except Exception as e:
            logger.error(f"Invalid ipa_regex '{ipa_regex}': {e}")

    # 2. Fuzzy Match with Name or Repo Name
    # This handles "UTM-HV" matching "UTM HV" or "UTM_HV"
    norm_app_name = normalize_name(app_config['name'])
    norm_repo_name = normalize_name(app_config['github_repo'].split('/')[-1])
    
    # Track scores for fallback
    scored_assets = []
    
    # Extract "flavor" keywords from app name (e.g., "SideStore" from "LiveContainer + SideStore")
    # We do this before full normalization to keep words separate
    name_clean = re.sub(r'\s*\((.*?)\)', '', app_config['name']) # Remove (Nightly) etc.
    name_words = set(re.findall(r'[a-zA-Z0-9]{3,}', name_clean.lower()))
    repo_words = set(re.findall(r'[a-zA-Z0-9]{3,}', app_config['github_repo'].lower()))
    flavor_keywords = name_words - repo_words

    for a in ipa_assets:
        base_name = os.path.splitext(a['name'])[0]
        norm_base = normalize_name(base_name)
        
        # Exact match (after normalization) is best
        if norm_base == norm_app_name or norm_base == norm_repo_name:
            return a
            
        # Calculate a subset score
        score = 0
        if norm_app_name in norm_base: score += 10
        if norm_base in norm_app_name: score += 5
        
        # Bonus for matching "flavor" keywords
        base_name_lower = base_name.lower()
        for kw in flavor_keywords:
            if kw in base_name_lower:
                score += 20
        
        scored_assets.append((score, a))

    if scored_assets:
        scored_assets.sort(key=lambda x: x[0], reverse=True)
        if scored_assets[0][0] > 0:
            return scored_assets[0][1]

    # 3. Smart Filtering: Exclude common "flavors" if multiple exist
    # We prefer the one without suffixes like -Remote, -HV, -SE
    exclude_patterns = ['-remote', '-hv', '-se', '-jailbroken', '-macos', '-linux', '-windows']
    
    filtered = []
    for a in ipa_assets:
        name_lower = a['name'].lower()
        if not any(p in name_lower for p in exclude_patterns):
            filtered.append(a)
            
    if filtered:
        return filtered[0]
        
    # 4. Fallback: Just return the first one
    return ipa_assets[0]

def is_square_image(image_url, client, tolerance=0.05):
    """Check if image at URL is approximately square."""
    if not image_url or not image_url.startswith(('http://', 'https://')):
        return False
    try:
        response = client.get(image_url, timeout=10)
        if not response: return False
        
        img = Image.open(BytesIO(response.content))
        width, height = img.size
        aspect_ratio = width / height
        return (1.0 - tolerance) <= aspect_ratio <= (1.0 + tolerance)
    except Exception as e:
        logger.warning(f"Could not check aspect ratio for {image_url}: {e}")
        return True # Assume OK if check fails

def apply_bundle_id_suffix(bundle_id, app_name, repo_name):
    """Apply unique suffixes to bundle identifier based on app name/flavor."""
    if not bundle_id: return bundle_id
    
    name_lower = app_name.lower()
    suffixes = ['nightly', 'beta', 'alpha', 'dev', 'test', 'experimental', 'pre-release', 'jit', 'sidestore']
    
    found_suffix = False
    for s in suffixes:
        if s in name_lower:
            if not bundle_id.endswith(f".{s}"):
                bundle_id = f"{bundle_id}.{s}"
            found_suffix = True
            break
    
    if not found_suffix:
        repo_name_clean = repo_name.split('/')[-1].lower()
        if normalize_name(app_name) != normalize_name(repo_name_clean):
            # Use the extra parts of the name as suffix
            extra = name_lower.replace(repo_name_clean, '').strip()
            extra_clean = re.sub(r'[^a-z0-9]', '', extra)
            if extra_clean and len(extra_clean) > 2:
                if not bundle_id.endswith(f".{extra_clean}"):
                    bundle_id = f"{bundle_id}.{extra_clean}"
    return bundle_id

def process_app(app_config, existing_source, client, apps_list_to_update=None):
    repo = app_config['github_repo']
    name = app_config['name']
    
    logger.info(f"Processing {name} ({repo})...")
    
    # Improved matching: Must match BOTH repo and name to support flavors
    app_entry = next((a for a in existing_source['apps'] 
                      if a.get('githubRepo') == repo and a.get('name') == name), None)

    # Fallback for migration: if no exact match, try repo-only match if it's the only one
    if not app_entry:
        repo_matches = [a for a in existing_source['apps'] if a.get('githubRepo') == repo]
        if len(repo_matches) == 1:
            app_entry = repo_matches[0]

    found_icon_auto = None

    if app_entry:
        app_entry['githubRepo'] = repo 
        app_entry['name'] = name 
        
        # 1. Update Bundle ID immediately for coexistence (even if version is up to date)
        if 'bundleIdentifier' in app_entry:
            old_id = app_entry['bundleIdentifier']
            new_id = apply_bundle_id_suffix(old_id, name, repo)
            if old_id != new_id:
                logger.info(f"Updated Bundle ID for {name}: {old_id} -> {new_id}")
                app_entry['bundleIdentifier'] = new_id
        
        # 2. Icon Selection: Compare user-provided vs. auto-discovered
        config_icon = app_config.get('icon_url')
        current_icon = app_entry.get('iconURL')
        
        best_icon = config_icon if config_icon and config_icon not in ['None', '_No response_'] else current_icon
        
        # Always try to find the best possible icon from the repo
        repo_icons = find_best_icon(repo, client)
        repo_icon = None
        if repo_icons:
            # Try to find the first square one
            for cand in repo_icons:
                if is_square_image(cand, client):
                    repo_icon = cand
                    break
            else:
                repo_icon = repo_icons[0]
        
        if repo_icon:
            if not best_icon:
                best_icon = repo_icon
            else:
                # Compare scores, but give preference to squareness
                score_current = score_icon_path(best_icon)
                score_repo = score_icon_path(repo_icon)
                
                # If current icon is not square but repo icon is, definitely switch
                current_is_square = is_square_image(best_icon, client)
                repo_is_square = is_square_image(repo_icon, client)
                
                if repo_is_square and not current_is_square:
                    logger.info(f"Replacing non-square icon with square version from repo: {repo_icon}")
                    best_icon = repo_icon
                elif score_repo > score_current:
                    logger.info(f"Replacing icon with better version from repo: {repo_icon} (Score {score_repo} > {score_current})")
                    best_icon = repo_icon
        
        if best_icon:
            app_entry['iconURL'] = best_icon

        config_tint = app_config.get('tint_color')
        if config_tint:
            app_entry['tintColor'] = config_tint
        elif not app_entry.get('tintColor') or app_entry.get('tintColor') == '#000000':
             extracted = extract_dominant_color(app_entry['iconURL'], client)
             if extracted: app_entry['tintColor'] = extracted
        
        app_entry.pop('permissions', None)
    
    release = client.get_latest_release(
        repo, 
        prefer_pre_release=app_config.get('pre_release', False),
        tag_regex=app_config.get('tag_regex')
    )

    if not release:
        logger.warning(f"No release found for {name}")
        return existing_source

    # Find IPA
    ipa_asset = select_best_ipa(release.get('assets', []), app_config)
    if not ipa_asset:
        logger.warning(f"No IPA found for {name}")
        return existing_source

    download_url = ipa_asset['browser_download_url']
    
    # Check if version exists (Skip download)
    if app_entry:
         if any(v.get('downloadURL') == download_url for v in app_entry.get('versions', [])):
             logger.info(f"Skipping {name} (Already up to date)")
             return existing_source

    logger.info(f"Downloading IPA for {name}...")
    
    fd, temp_path = tempfile.mkstemp(suffix='.ipa')
    os.close(fd)
    
    try:
        with client.session.get(download_url, stream=True, timeout=300) as r:
            r.raise_for_status()
            with open(temp_path, 'wb') as f:
                shutil.copyfileobj(r.raw, f)

        default_bundle_id = f"com.placeholder.{name.lower().replace(' ', '')}"
        version, build, bundle_id = get_ipa_metadata(temp_path, default_bundle_id)
        
        if not version:
            logger.warning(f"Failed to parse IPA metadata for {name}, using fallback.")
            version = release['tag_name'].lstrip('v')
            bundle_id = default_bundle_id

        sha256 = get_ipa_sha256(temp_path)
        
        # Ensure pre-release versions have unique bundle identifiers to coexist
        bundle_id = apply_bundle_id_suffix(bundle_id, name, repo)

    except Exception as e:
        logger.error(f"Download or processing failed for {name}: {e}")
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return existing_source
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
    
    repo_info = client.get_repo_info(repo) or {}
    
    repo_desc = repo_info.get('description') or "No description available."
    main_desc = repo_desc
    
    version_desc = release['body'] or "Update"
    release_date = release['published_at'].split('T')[0]

    new_version_entry = {
        "version": version,
        "date": release_date,
        "localizedDescription": version_desc,
        "downloadURL": download_url,
        "size": ipa_asset['size'],
        "sha256": sha256
    }

    if app_entry:
        logger.info(f"New version {version} detected for {name}")
        app_entry['versions'].insert(0, new_version_entry)
        app_entry.update({
            "version": version,
            "versionDate": release_date,
            "versionDescription": version_desc,
            "downloadURL": download_url,
            "localizedDescription": main_desc, 
            "size": ipa_asset['size'],
            "sha256": sha256,
            "bundleIdentifier": bundle_id 
        })
    else:
        logger.info(f"Adding new app: {name}")
        
        # Handle Icon (Config > Auto-fetch > Fallback)
        icon_url = app_config.get('icon_url', '')
        if not icon_url or icon_url in ['None', '_No response_']:
            icon_candidates = find_best_icon(repo, client)
            if icon_candidates:
                # Try to find the first square icon among top candidates
                for cand in icon_candidates:
                    if is_square_image(cand, client):
                        icon_url = cand
                        logger.info(f"Selected square icon for {name}: {icon_url}")
                        break
                else:
                    # Fallback to the best scored one if no square found
                    icon_url = icon_candidates[0]
                    logger.warning(f"No square icon found for {name}, using best candidate: {icon_url}")
        
        tint_color = app_config.get('tint_color')
        if not tint_color:
             extracted = extract_dominant_color(icon_url, client)
             tint_color = extracted if extracted else '#000000'

        app_entry = {
            "name": name,
            "githubRepo": repo, 
            "bundleIdentifier": bundle_id,
            "developerName": repo.split('/')[0],
            "version": version,
            "versionDate": release_date,
            "versionDescription": version_desc,
            "downloadURL": download_url,
            "localizedDescription": main_desc,
            "iconURL": icon_url,
            "tintColor": tint_color,
            "size": ipa_asset['size'],
            "permissions": {}, 
            "screenshotURLs": [], 
            "versions": [new_version_entry]
        }
        existing_source['apps'].append(app_entry)

    # Sync found metadata back to apps_list_to_update
    if found_icon_auto and apps_list_to_update is not None:
        # Find the original config entry
        orig_config = next((item for item in apps_list_to_update if item.get('github_repo') == repo), None)
        if orig_config:
            if not orig_config.get('icon_url'):
                logger.info(f"Syncing found icon back to apps.json for {name}")
                orig_config['icon_url'] = found_icon_auto

    return existing_source

def update_repo(config_file, source_file, source_name, source_identifier, client):
    if not os.path.exists(config_file):
        logger.warning(f"Config file not found: {config_file}")
        return

    apps = load_json(config_file)
    # Create a snapshot to detect changes
    import copy
    original_apps = copy.deepcopy(apps)
    
    source_data = load_existing_source(source_file, source_name, source_identifier)
    
    source_data['name'] = source_name
    source_data['identifier'] = source_identifier
    
    for app in apps:
        source_data = process_app(app, source_data, client, apps_list_to_update=apps)
    
    # Check if we need to save back changes to apps.json
    if apps != original_apps:
        logger.info(f"Updating {config_file} with auto-detected metadata...")
        save_json(config_file, apps)
    
    # Filter and sort
    valid_repos = set(app['github_repo'] for app in apps)
    valid_names = set((app['github_repo'].split('/')[0], app['name']) for app in apps)

    new_apps_list = []
    for a in source_data['apps']:
        repo = a.get('githubRepo')
        if repo:
            if repo in valid_repos:
                new_apps_list.append(a)
        else:
            if (a.get('developerName'), a.get('name')) in valid_names:
                new_apps_list.append(a)
    
    source_data['apps'] = new_apps_list
    
    app_order = {app['github_repo']: idx for idx, app in enumerate(apps)}
    
    def get_sort_key(app_entry):
        repo = app_entry.get('githubRepo')
        if repo:
             return app_order.get(repo, 9999)
        return 9999

    source_data['apps'].sort(key=get_sort_key)
    save_json(source_file, source_data)

def generate_combined_apps_md(source_file_standard, source_file_nsfw, output_file):
    """Generate a combined Markdown file listing all apps using local source.json data."""
    
    def write_table_from_source(f, source_path):
        if not os.path.exists(source_path):
            return
            
        source_data = load_json(source_path)
        
        f.write("| Icon | Name | Description | Source |\n")
        f.write("| :---: | :--- | :--- | :--- |\n")
        
        for app in source_data.get('apps', []):
            name = app.get('name', 'Unknown')
            repo = app.get('githubRepo', '')
            icon = app.get('iconURL', '')
            
            description = app.get('localizedDescription', 'No description available.')
            description = description.split('\n')[0] 
            
            icon_md = f"<img src=\"{icon}\" width=\"48\" height=\"48\">" if icon else ""
            repo_link = f"[{repo}](https://github.com/{repo})" if repo else name
            
            f.write(f"| {icon_md} | **{name}** | {description} | {repo_link} |\n")

    dir_path = os.path.dirname(output_file) or '.'
    os.makedirs(dir_path, exist_ok=True)

    try:
        with tempfile.NamedTemporaryFile('w', dir=dir_path, delete=False, encoding='utf-8') as tmp:
            tmp.write("# Supported Apps\n\n")
            tmp.write(f"> *Last Updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} (UTC)*\n\n")
            
            source_file_standard_json = source_file_standard.replace('apps.json', 'source.json')
            if os.path.exists(source_file_standard_json):
                tmp.write("## Standard Apps\n\n")
                write_table_from_source(tmp, source_file_standard_json)
                tmp.write("\n")

            source_file_nsfw_json = source_file_nsfw.replace('apps.json', 'source.json')
            if os.path.exists(source_file_nsfw_json):
                tmp.write("## NSFW Apps\n\n")
                write_table_from_source(tmp, source_file_nsfw_json)
                tmp.write("\n")
            
            tmp_path = tmp.name
        
        os.replace(tmp_path, output_file)
        logger.info(f"Generated {output_file}")
        
    except Exception as e:
        logger.error(f"Failed to generate {output_file}: {e}")
        if 'tmp_path' in locals() and os.path.exists(tmp_path):
            os.remove(tmp_path)

def main():
    client = GitHubClient()

    # Update Standard Source
    update_repo('sources/standard/apps.json', 'sources/standard/source.json', "Aiko3993's Sideload Source", "io.github.aiko3993.source", client)
    
    # Update NSFW Source
    update_repo('sources/nsfw/apps.json', 'sources/nsfw/source.json', "Aiko3993's Sideload Source (NSFW)", "io.github.aiko3993.source.nsfw", client)

    # Generate Combined App List
    generate_combined_apps_md('sources/standard/apps.json', 'sources/nsfw/apps.json', 'APPS.md')

if __name__ == "__main__":
    main()
