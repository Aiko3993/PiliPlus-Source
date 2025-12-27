
import { APP_MODES, TRANSLATIONS } from './config.js';
import { getSourceUrl, getIcon, roundRect } from './utils.js';
import { getState, setState } from './state.js';
import { renderApps, updateSourceUI, updateHeaderIcon, updateFavicon } from './ui.js';

const grid = document.getElementById('apps-grid');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');

export async function fetchSource(sourceKey) {
    grid.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-24 text-center animate-pulse">
            <div class="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-4"></div>
            <div class="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
        </div>`;
    emptyState.classList.add('hidden');
    
    try {
        let currentApps = [];
        if (sourceKey === 'all') {
            const [standardRes, nsfwRes] = await Promise.all([
                fetch(`${getSourceUrl(APP_MODES['standard'].path)}?t=${Date.now()}`),
                fetch(`${getSourceUrl(APP_MODES['nsfw'].path)}?t=${Date.now()}`)
            ]);

            if (!standardRes.ok && !nsfwRes.ok) throw new Error("Failed to load any source");

            let allApps = [];
            if (standardRes.ok) {
                const data = await standardRes.json();
                allApps = allApps.concat(data.apps || []);
            }
            if (nsfwRes.ok) {
                const data = await nsfwRes.json();
                allApps = allApps.concat(data.apps || []);
            }

            const seen = new Set();
            currentApps = allApps.filter(app => {
                const key = app.bundleIdentifier || app.name;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
        } else {
            const url = `${getSourceUrl(APP_MODES[sourceKey].path)}?t=${Date.now()}`;
            const response = await fetch(url, { cache: "no-store" });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            currentApps = data.apps || [];
        }
        
        setState('currentApps', currentApps);
        renderApps();
        
        if(history.pushState) {
            history.pushState(null, null, `#${sourceKey}`);
        } else {
            location.hash = `#${sourceKey}`;
        }

    } catch (err) {
        console.error(err);
        const { currentLang } = getState();
        const t = TRANSLATIONS[currentLang];
        grid.innerHTML = `
            <div class="col-span-full text-center py-24">
                <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4">
                    ${getIcon('error', 'w-6 h-6')}
                </div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">${t.loadFailedTitle}</h3>
                <p class="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-md mx-auto">
                    ${t.loadFailedDesc}
                </p>
                <button onclick="window.fetchSource('${sourceKey}')" class="mt-4 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                    ${t.retry}
                </button>
            </div>
        `;
    }
}

export function switchSource(key) {
    const { currentSource, currentApps } = getState();
    if (currentSource === key && currentApps.length > 0) return;
    const mode = APP_MODES[key];
    if (!mode) return;
    
    setState('currentSource', key);
    
    // Safety check for meta tags
    const docEl = document.documentElement;
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    
    if (docEl) docEl.setAttribute('data-theme', mode.theme);
    if (metaTheme) metaTheme.setAttribute('content', mode.themeColor);
    
    updateHeaderIcon(key);
    updateFavicon(key);
    updateSourceUI(key);
    fetchSource(key);
}

export function toggleSource() {
    const { currentSource } = getState();
    const next = APP_MODES[currentSource].nextMode;
    switchSource(next);
}
