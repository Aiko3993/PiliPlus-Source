
// State Management
const state = {
    currentApps: [],
    currentSource: 'standard',
    currentSort: 'date',
    currentLang: 'zh',
    // Cache for themes
    themeCache: new Map()
};

export const getState = () => state;

export const setState = (key, value) => {
    state[key] = value;
};

export const getThemeCache = () => state.themeCache;
