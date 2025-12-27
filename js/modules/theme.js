
import { parseHex, rgbToHsl, hslToRgb, getContrastColor } from './utils.js';
import { getThemeCache } from './state.js';

export function getAccessibleColors(hex) {
    const rgb = parseHex(hex);
    if (!rgb) return { textLight: '0,0,0', textDark: '255,255,255', decorLight: '0,0,0', decorDark: '255,255,255' };
    const { r, g, b } = rgb;
    const [h, s, l] = rgbToHsl(r, g, b);
    
    const lTextLight = Math.min(l, 0.4);
    const [rTL, gTL, bTL] = hslToRgb(h, s, lTextLight);
    
    const lTextDark = Math.max(l, 0.7);
    const sTextDark = Math.min(s, 0.8);
    const [rTD, gTD, bTD] = hslToRgb(h, sTextDark, lTextDark);
    
    const lDecorLight = Math.min(l, 0.6);
    const [rDL, gDL, bDL] = hslToRgb(h, s, lDecorLight);

    const lDecorDark = Math.max(l, 0.4); 
    const [rDD, gDD, bDD] = hslToRgb(h, s, lDecorDark);

    return {
        textLight: `${rTL}, ${gTL}, ${bTL}`,
        textDark: `${rTD}, ${gTD}, ${bTD}`,
        decorLight: `${rDL}, ${gDL}, ${bDL}`,
        decorDark: `${rDD}, ${gDD}, ${bDD}`
    };
}

export function getAppTheme(app) {
    let tint = app.tintColor;
    if (!tint || !/^#?([0-9A-F]{3}|[0-9A-F]{6})$/i.test(tint)) tint = '#3b82f6';
    
    const THEME_CACHE = getThemeCache();
    if (THEME_CACHE.has(tint)) return THEME_CACHE.get(tint);
    
    const textColor = getContrastColor(tint);
    const accessibleColors = getAccessibleColors(tint);
    
    const glowRgbLight = accessibleColors.decorLight;
    const glowRgbDark = accessibleColors.decorDark;
    
    // Legacy shadows for Flat theme
    const glowShadow = `0 0 40px rgba(var(--app-glow-rgb), var(--glow-opacity))`;
    const iconShadow = `0 4px 12px -2px rgba(var(--current-glow), var(--icon-glow-opacity))`;

    const theme = { tint, textColor, accessibleColors, glowRgbLight, glowRgbDark, glowShadow, iconShadow };
    THEME_CACHE.set(tint, theme);
    return theme;
}

export function applyModalTheme({ tint, accessibleColors, glowRgbLight, glowRgbDark }) {
    const modalRoot = document.getElementById('modal-panel');
    if (modalRoot) {
        modalRoot.style.setProperty('--modal-tint-light', `rgb(${accessibleColors.textLight})`);
        modalRoot.style.setProperty('--modal-tint-dark', `rgb(${accessibleColors.textDark})`);
        modalRoot.style.setProperty('--modal-glow-light', glowRgbLight);
        modalRoot.style.setProperty('--modal-glow-dark', glowRgbDark);
        modalRoot.style.setProperty('--modal-btn-text-light', getContrastColor(tint));
        modalRoot.style.setProperty('--modal-btn-text-dark', getContrastColor(tint));
    }
}
