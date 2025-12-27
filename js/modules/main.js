
import { APP_MODES, SORT_MODES, SORT_MAP } from './config.js';
import { detectLanguage, debounce } from './utils.js';
import { getState, setState } from './state.js';
import { renderApps, updateLanguage, updateSourceUI, updateHeaderIcon, updateFavicon, showToast, copySourceURL, handleDownloadClick, openModal, closeModal, collapseAllExpanded } from './ui.js';
import { fetchSource, switchSource, toggleSource } from './data.js';
import { handleEasterEgg, showDeveloperConsolePrompt, initCheatCodes } from './effects.js';

// Expose functions to window for HTML event handlers
window.handleDownloadClick = handleDownloadClick;
window.openModal = openModal;
window.closeModal = closeModal;
window.copySourceURL = copySourceURL;
window.toggleSource = toggleSource;
window.handleEasterEgg = handleEasterEgg;
window.switchSource = switchSource;
window.fetchSource = fetchSource;

// Init Cheat Codes
initCheatCodes();

// Sort Logic
function setSort(mode) {
    const { currentSort } = getState();
    if (currentSort === mode) return;
    setState('currentSort', mode);
    
    const track = document.getElementById('sort-label-track');
    const index = SORT_MAP[mode];
    if(track) track.style.transform = `translateY(-${index * 24}px)`;
    renderApps();
}

window.cycleSort = function() {
    const { currentSort } = getState();
    const currentIndex = SORT_MODES.indexOf(currentSort);
    const nextIndex = (currentIndex + 1) % SORT_MODES.length;
    setSort(SORT_MODES[nextIndex]);
};

// Error Handling
window.onerror = function(msg, url, lineNo, columnNo, error) {
    if (msg.includes('ResizeObserver') || msg.includes('Context lost')) return;
    const log = document.getElementById('debug-log');
    if (log) {
        log.classList.remove('hidden');
        log.innerHTML += `[Error] ${msg} (${lineNo}:${columnNo})<br>`;
    }
    return false;
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    // Detect Mobile
    const mobileMediaQuery = window.matchMedia ? window.matchMedia('(hover: none), (pointer: coarse)') : { matches: false };
    window.isMobile = function() { return mobileMediaQuery.matches; };

    // Initial State
    const hash = location.hash.replace('#', '');
    let startSource = 'standard';
    if (APP_MODES[hash]) startSource = hash;
    
    setState('currentSource', startSource);
    
    updateLanguage(detectLanguage());
    updateSourceUI(startSource);
    
    // Initial fetch
    const docEl = document.documentElement;
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    const mode = APP_MODES[startSource];
    
    if (docEl) docEl.setAttribute('data-theme', mode.theme);
    if (metaTheme) metaTheme.setAttribute('content', mode.themeColor);
    
    updateHeaderIcon(startSource);
    updateFavicon(startSource);
    
    fetchSource(startSource);

    // Search Listener
    const searchInput = document.getElementById('search-input');
    if(searchInput) {
        const debouncedRender = debounce(renderApps, 300);
        
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = e.target.value.toLowerCase().trim();
                if (val === 'debug') {
                    e.preventDefault();
                    showDeveloperConsolePrompt();
                }
            }
        });

        searchInput.addEventListener('input', (e) => {
            debouncedRender();
        });
    }
    
    // Global click listener for closing expanded buttons
    document.addEventListener('click', (e) => {
        if (typeof window.isMobile === 'function' && !window.isMobile()) return;
        if (!e.target.closest('a[onclick*="handleDownloadClick"]')) collapseAllExpanded();
    });

    // Back to top scroll handler
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
                backToTopBtn.classList.add('opacity-100', 'translate-y-0');
            } else {
                backToTopBtn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
                backToTopBtn.classList.remove('opacity-100', 'translate-y-0');
            }
        }, { passive: true });
    }
});
