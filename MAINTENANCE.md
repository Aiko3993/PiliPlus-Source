# Project Maintenance Manual (MAINTENANCE.md)

> **⚠️ CRITICAL WARNING**: 
> 1. This file is **LOCAL ONLY**. It is listed in `.gitignore` and must **NEVER** be committed to the remote repository.
> 2. This serves as the private operational guide for the Maintainer and AI Assistants.
> 3. All contributors must read this carefully before making any modifications.

## 1. Project Architecture

This project aims to be compatible with AltStore / SideStore / LiveContainer. Its core functionality is to automatically fetch GitHub Releases via Python scripts and generate source files that meet the standards.

### 1.1 Core Directory Structure (Main Branch)

The `main` branch serves as the development source. It does **NOT** directly contain the deployable website root files.

```
.
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── add_app.yml         # [TEMPLATE] "Add App" issue form definition (Options auto-synced)
│   │   └── config.yml          # [CONFIG] Issue template configuration
│   ├── scripts/
│   │   ├── add_app.py          # [UTILITY] Handles app requests (add/remove), supports dynamic categories
│   │   ├── update_source.py    # [CORE] Full source regeneration, Icon auto-discovery, & APPS.md builder (from source.json)
│   │   ├── validate_apps.py    # [VALIDATION] Validates apps.json (auto-discovers config files)
│   │   ├── sync_issue_template.py # [AUTOMATION] Syncs directory structure to Issue Template dropdowns
│   │   └── utils.py            # [SHARED] Common utilities (JSON, Logger, GitHub Client, Icon Finder)
│   └── workflows/
│       ├── deploy.yml          # [CI] Deploys website and source files to gh-pages
│       ├── process_issue.yml   # [CI] Automates app addition/rejection from issues
│       ├── update.yml          # [CI] Scheduled task to update source.json hourly
│       └── validate_json.yml   # [CI] Validates PRs modifying apps.json
├── website/                    # [WEB SOURCE] Source files for the website
│   ├── css/
│   │   └── flat.css            # [STYLE] Main stylesheet
│   ├── js/
│   │   ├── modules/            # [LOGIC] ES Modules for frontend logic
│   │   │   ├── config.js       # [CONFIG] Paths, icons, and translations
│   │   │   ├── data.js         # [DATA] Fetching and parsing source JSON
│   │   │   ├── effects.js      # [UI] Easter eggs and visual effects
│   │   │   ├── main.js         # [ENTRY] Main application entry point
│   │   │   ├── state.js        # [STATE] Global state management
│   │   │   ├── theme.js        # [UI] Theme switching and dynamic colors
│   │   │   ├── ui.js           # [UI] DOM manipulation and rendering
│   │   │   └── utils.js        # [SHARED] Helper functions
│   │   └── tailwind-config.js  # [CONFIG] Tailwind CSS configuration
│   └── index.html              # [WEB] Static landing page source
├── sources/
│   ├── nsfw/
│   │   ├── apps.json           # [DATA] NSFW edition app list (Manually maintained)
│   │   └── source.json         # [ARTIFACT] NSFW edition source file (Auto-generated)
│   └── standard/
│       ├── apps.json           # [DATA] Standard edition app list (Manually maintained)
│       └── source.json         # [ARTIFACT] Standard edition source file (Auto-generated)
├── .gitignore                  # [CONFIG] Git ignore rules
├── APPS.md                     # [DOCS] Auto-generated list of supported apps
├── CONTRIBUTING.md             # [DOCS] Contribution guide (English)
├── CONTRIBUTING_CN.md          # [DOCS] Contribution guide (Chinese)
├── LICENSE                     # [LEGAL] MIT License
├── MAINTENANCE.md              # [DOCS] Project Maintenance Manual (Local Only - .gitignore)
├── README.md                   # [DOCS] Project overview (English)
└── README_CN.md                # [DOCS] Project overview (Chinese)
```

### 1.2 Deployment Directory Structure (gh-pages Branch)

The `gh-pages` branch is an **orphan branch** (automatically constructed by CI). It is the actual content served by GitHub Pages.
**DO NOT** modify this branch manually.

The deployment structure is a flattened version of `main`:
1.  **Website Root**: Contents of `website/` are moved to the root.
2.  **Data Sources**: `sources/` directory is preserved to ensure stable data paths (e.g., `./sources/standard/source.json`).
3.  **Documentation**: `APPS.md` is copied to the root for easy access.

```
. (Root)
├── index.html                  # [WEB] Entry point (from website/)
├── css/                        # [STYLE] Stylesheets
├── js/                         # [LOGIC] Frontend modules & config
├── sources/                    # [DATA] JSON Data Sources (Preserved structure)
└── APPS.md                     # [DOCS] Generated App List
```

### 1.3 Key Configuration Files

*   **apps.json (`sources/standard/`, `sources/nsfw/`)**:
    *   The data source of the project.
    *   **Must include**: `name`, `github_repo` (Format: `Owner/Repo`).
    *   **Optional**: 
        *   `icon_url`, `tint_color` (Must be hex code `#RRGGBB`).
        *   `ipa_regex`: A regular expression to select a specific IPA from GitHub Releases (useful for apps with multiple flavors like UTM).
        *   `pre_release`: Boolean (default: `false`). Set to `true` to prefer pre-releases/nightly versions.
        *   `tag_regex`: A regular expression to filter releases by their tag name.
    *   **Note**: Multiple entries for the same repository are allowed as long as their `name` is unique (e.g., "UTM" and "UTM (TrollStore)").
*   **deploy.yml (`.github/workflows/`)**:
    *   Responsible for assembling the website and source files and pushing them to the `gh-pages` branch.
    *   Triggered by `push` to `main` or completion of update/process workflows.

### 1.4 Dependency Management

This project mainly depends on the Python environment, and dependencies are defined in the CI workflow (see `.github/workflows/update.yml`).

*   **Python Version**: 3.x
*   **Core Libraries**:
    *   `requests`: Network requests
    *   `Pillow`: Image processing (extracting icon dominant color)
    *   `urllib3`: Handling retry logic

### 1.5 Frontend Features

*   **Dynamic Theming**: App cards extract dominant colors or use `tint_color` from `apps.json` to generate glow effects and button colors.
*   **Easter Egg System**:
    *   Triggered by rapidly clicking the status dot (footer) multiple times.
    *   **Sequence**: `triggerElementEater` (Intro animation, footer turns red and vanishes) -> `triggerConfetti` (Random visual effect like Matrix Rain or Pong) -> Auto Cleanup.
    *   **Debug Console**: Accessed by typing `debug` in the search bar. Allows manual triggering of individual effects for testing.

---

## 2. Strict Maintenance Process

### 2.1 Code Modification Guidelines

1.  **Branch Management**:
    *   **`main` Branch**: Contains source code, scripts, and documentation.
    *   **`gh-pages` Branch**: Strictly for deployment artifacts. **DO NOT** commit directly to `gh-pages`. It is forcefully overwritten by CI.
2.  **Validation Requirements**:
    *   **Logic Changes**: After modifying Python scripts, they must be simulated locally to ensure no errors.
    *   **Configuration Changes**: After modifying `apps.json`, the validation script must be run:
        ```bash
        python .github/scripts/validate_apps.py
        ```
3.  **Pre-commit Checks**:
    *   Run the complete local testing process.
    *   Ensure clean code formatting and remove unnecessary debug prints.

### 2.2 Change Control

*   **⚠️ No Direct Pushes**: All code changes must be merged via Pull Request (PR).
*   **Code Review**: PRs require at least one self-review (or peer review) to confirm no logical loopholes.

---

## 3. AI Collaboration Guidelines

This section is designed for AI coding assistants (e.g., Trae, Copilot, etc.). Please execute strictly.

### ⚠️ AI Specific Warnings

*   **Local Validation**: All generated Python code or JSON modifications **must** be verified by running validation tools in the local environment first before suggesting submission to the user.
*   **No Auto-Operations**: AI is **absolutely forbidden** from automatically executing `git commit` or `git push` commands.
*   **Permission First**: AI shall **NOT** ask or suggest to commit/push changes unless the user has explicitly requested it or the current task clearly implies deployment/release. Do not prompt for git operations in standard coding/debugging tasks.
*   **Debug Ports**: If a local server needs to be started (e.g., testing `website/index.html`), the port number must be explicitly informed to the user (e.g., `http://localhost:8000`).
*   **Web Interface Testing**:
    *   **MANDATORY**: For ANY website-related change (HTML/CSS/JS/Assets), regardless of size, you **MUST** launch a local server (`python3 -m http.server`) to verify.
    *   Provide the preview link (`http://localhost:8000`) to the user.
    *   Verify responsiveness, console logs, and network requests before confirming completion.

### AI Operation Log Requirements

When assisting with debugging or maintenance, AI should:
1.  **Record Commands**: Clearly list all shell commands attempted.
2.  **Preserve Output**: Keep copies of key error messages or script outputs in the conversation for backtracking.

### Documentation Refactoring Guidelines

When the AI is requested to refactor or update core documentation (e.g., `README.md`, `CONTRIBUTING.md`):

1.  **Trigger Condition**: Explicit user request to organize, translate, or improve documentation structure.
2.  **Standards**:
    *   **Consistency**: Ensure terminology aligns with `MAINTENANCE.md` (e.g., directory names, script roles).
    *   **Accuracy**: Verify all links (e.g., to `APPS.md` or `sources/standard/apps.json`) are valid.
    *   **Clarity**: Use standard Markdown, clear headings, and concise language.
3.  **Scope**:
    *   AI is authorized to modify text, formatting, and structure.
    *   **Prohibited**: Changing core project configuration links or deleting copyright notices without permission.
4.  **Verification**:
    *   Preview the rendered Markdown to ensure tables and badges display correctly.
    *   Check for broken links relative to the project root.

---

## 4. Deployment Process

### 4.1 Website and Source Release

This project uses GitHub Actions and GitHub Pages for automated deployment.

*   **Trigger Mechanism**:
    *   `deploy.yml`: The central deployment workflow. It triggers on:
        *   Push to `main`.
        *   Completion of `Process App Request` (Issue processing).
        *   Completion of `Update Source` (Scheduled updates).
*   **Release Architecture**:
    *   **Source (`main`)**: Clean development environment. Website assets are stored in `website/`.
    *   **Deployment (`gh-pages`)**: 
        *   An **Orphan Branch** (no history shared with main).
        *   Constructed dynamically by CI.
        *   **Content**:
            *   Files from `website/` -> Moved to root.
            *   Files from `sources/standard/` & `sources/nsfw/` -> Copied to `sources/` directory.
            *   `APPS.md` -> Copied to root.
    *   **GitHub Pages Configuration**: Must be set to build from the **`gh-pages`** branch.
    *   **⚠️ IMPORTANT**: Do not edit files on `gh-pages` manually. They will be overwritten. Edit files in `website/` on `main` instead.

### 4.2 Test Requirements

*   **End-to-End Test (E2E)**:
    *   Before major logic changes (e.g., modifying IPA parsing logic), `update_source.py` must be manually triggered to run through a complete process.
*   **Log Retention**:
    *   GitHub Actions run logs are key for troubleshooting. Immediately download logs for analysis upon deployment failure.
*   **Documentation Auto-Update**:
    *   `APPS.md` is automatically regenerated during the update process. It includes a "Last Updated" timestamp and individual app update dates. Do not manually edit this file.

---

## 5. Emergency Response Plan

### 5.1 Problem Diagnosis

| Phenomenon | Possible Cause | Troubleshooting Scheme |
| :--- | :--- | :--- |
| **CI Run Failed** | API Rate Limit / Network Fluctuation | Check `429 Too Many Requests` or timeout errors in Actions logs. Usually retries automatically. |
| **Source File Empty/Corrupt** | JSON Format Error / Script Exception | Check local `apps.json` format; Rollback recent commit. |
| **App Not Updating** | Repo No Release / No IPA | Check if the target GitHub repo has a published Release containing `.ipa` files. |
| **Validation Failed** | Missing Fields / Duplicate Addition | Run `python .github/scripts/validate_apps.py` to locate specific lines. |
| **Deployment Failed (gh-pages)** | Git Conflict / Missing Files | Check `deploy.yml` logs. Ensure `website/` directory exists and contains index.html. |

### 5.2 Rollback Mechanism

In case of severe failure (e.g., generating a corrupted source.json causing client crashes):

1.  **Pause Auto-Update**:
    *   Disable `Update Source` workflow in GitHub Actions page.
2.  **Version Snapshot Rollback**:
    *   Find the last normal Commit ID.
    *   Execute rollback operations:
        ```bash
        git checkout main
        git revert HEAD  # Revert the last commit
        # Or reset to specific commit (Use with caution)
        # git reset --hard <commit-id> && git push --force
        ```
3.  **Restore Service**:
    *   Confirm the `source.json` format is correct after rollback.
    *   Re-enable GitHub Actions.

## Version History

| Version | Date | Maintainer | Description |
| :--- | :--- | :--- | :--- |
| v1.0 | 2025-12-20 | Maintainer | Initial version created, defining architecture and maintenance standards |
| v1.1 | 2025-12-20 | Maintainer | Updated scripts info (add_app.py), global duplicate check rules, and APPS.md auto-generation details |
| v1.2 | 2025-12-20 | Maintainer | Added Documentation Refactoring Guidelines for AI assistants |
| v1.3 | 2025-12-20 | Maintainer | Added explicit Web Interface Testing requirements (launch server + preview) |
| v1.4 | 2025-12-20 | Maintainer | Escalated Web Interface Testing to MANDATORY for all web changes |
| v1.5 | 2025-12-21 | Maintainer | updated process_issue.yml trigger rules (rejection flow) |
| v1.6 | 2025-12-21 | Maintainer | Modularized code (css/js folders)|
| v1.7 | 2025-12-21 | AI Assistant | Rewrite `add_app.py` and `process_issue.yml` to support app updates and better rejection handling. |
| v1.8 | 2025-12-22 | AI Assistant | Implemented dynamic source discovery (supporting arbitrary categories), added `sync_issue_template.py` for automated Issue Template updates, and refactored core scripts for robustness. |
| v1.9 | 2025-12-22 | AI Assistant | Introduced `.github/scripts/utils.py` for centralized logic and robust error handling. Refactored scripts to use shared utilities. Updated directory structure documentation. |
| v1.10 | 2025-12-22 | AI Assistant | **Major Architecture Change**: Isolated website source files to `website/` directory. Configured `gh-pages` as an orphan branch for deployment artifacts. Updated `deploy.yml` for cleaner main branch and hot-reloading support. |
| v1.11 | 2025-12-22 | AI Assistant | **Directory Consolidation**: Moved `standard/` and `nsfw/` into a unified `sources/` directory. Updated all scripts, workflows, and documentation to reflect this change. |
| v1.13 | 2025-12-22 | AI Assistant | **Frontend Overhaul**: Implemented modern "Flat Card" design with Tailwind CSS. Added dynamic theming based on app tint color. Refactored JS/CSS structure for modularity. |
| v1.14 | 2025-12-22 | AI Assistant | **Cleanup & Optimization**: Removed deprecated `index.html` from root. Updated `MAINTENANCE.md` to reflect new directory structure (ES Modules). Verified full CI pipeline robustness. |
| v1.15 | 2025-12-22 | AI Assistant | **Testing Infrastructure**: Added `.github/scripts/mock_test_runner.py` for comprehensive local logic verification without GitHub API dependencies. Updated validation guidelines. |
| v1.16 | 2025-12-22 | AI Assistant | **Logic Hardening**: Refined `process_issue.yml` and `add_app.py` to ensure robust icon URL extraction and commit message generation. Implemented "Sync Back" logic in `update_source.py` to automatically populate missing metadata in `apps.json` from auto-discovered sources. |
| v1.17 | 2025-12-23 | AI Assistant | **Easter Egg Overhaul**: Refactored `effects.js` significantly. <br>1. **Retro Pong**: Rewrote physics engine (acceleration, angular reflection), added game states (serve/play/score), and optimized touch handling.<br>2. **ASCII Waifu**: Replaced static art with `ART_COMPILER_V1.0` interactive terminal for custom ASCII injection.<br>3. **Safety**: Removed flash effects from Konami Code entry; added responsive text scaling.<br>4. **Stability**: Fixed `autoDismiss` logic across all effects. |
| v1.18 | 2025-12-23 | AI Assistant | **Infrastructure Fixes**: <br>1. **GitHub Actions**: Resolved 403 Forbidden error by removing task-level permission overrides in `process_issue.yml`. <br>2. **Issue Templates**: Fixed YAML syntax in `add_app.yml` to restore template visibility and enforced category ordering (Standard > NSFW). <br>3. **Bug Redirection**: Fully redirected Bug Reports to GitHub Discussions via `config.yml`. |
| v1.19 | 2025-12-23 | AI Assistant | **Release & IPA Logic Enhancements**: <br>1. **Stability First**: Default to latest stable release instead of newest pre-release. <br>2. **Nightly Support**: Added `pre_release` flag in `apps.json` to opt-in for beta/nightly versions. <br>3. **Tag Filtering**: Added `tag_regex` support to allow pinning or filtering releases by tag name. <br>4. **Smart IPA Picker**: Implemented `select_best_ipa` to automatically prioritize clean IPA names (filtering out `-Remote`, `-HV`, etc.) and added `ipa_regex` override support. <br>5. **Multi-Flavor Support**: Updated validation to allow multiple entries for the same repo with unique names. |

---


*Last Updated: 2025-12-23*
