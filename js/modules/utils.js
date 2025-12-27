
import { ICONS, TRANSLATIONS, PATH_CONFIG } from './config.js';

export function getIcon(name, className = "w-5 h-5") {
    try {
        if (!ICONS[name]) return '';
        return `<svg class="${className}" fill="none" stroke="currentColor" viewBox="0 0 24 24">${ICONS[name]}</svg>`;
    } catch (e) {
        return '';
    }
}

export function parseHex(hex) {
    if (!hex) return null;
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    if (hex.length !== 6) return null;
    return {
        r: parseInt(hex.substr(0, 2), 16),
        g: parseInt(hex.substr(2, 2), 16),
        b: parseInt(hex.substr(4, 2), 16)
    };
}

export function getContrastColor(hexColor) {
    const rgb = parseHex(hexColor);
    if (!rgb) return '#ffffff';
    const yiq = ((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
}

export function formatBytes(bytes, decimals = 1) {
    if (!bytes) return 'N/A';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function timeAgo(dateString, currentLang) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(currentLang, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) h = s = 0;
    else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, l];
}

export function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) r = g = b = l;
    else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

export function cleanMarkdown(text) {
    if (!text) return "";
    text = text.replace(/\[\/\/\]:\s*\(ANI-SERVER-MAGIC-SEPARATOR\)/g, '\n\n---\n\n');
    text = text.replace(/\(ANI-SERVER-MAGIC-SEPARATOR\)/g, '\n\n---\n\n');
    text = text.replace(/^\s*\[\/\/\]:.*$/gm, '');
    text = text.replace(/(\n|^)\s*----\s*(\n|$)/g, '\n\n---\n\n');
    return text;
}

export function detectLanguage() {
    const lang = navigator.language || navigator.userLanguage;
    if (lang.startsWith('zh')) return 'zh';
    return 'en';
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

export function getSourceUrl(path) {
    if (PATH_CONFIG.isLocalDev) {
        return `../${path}`;
    }
    return `./${path}`;
}

export function getPublicUrl(path) {
    return `${PATH_CONFIG.productionBase}${path}`;
}

export function copyToClipboard(text, successMsg, errorMsg, showToastFn) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => showToastFn(successMsg, 'success')).catch(() => showToastFn(errorMsg, 'error'));
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showToastFn(successMsg, 'success');
        } catch (err) {
            showToastFn(errorMsg, 'error');
        }
        document.body.removeChild(textArea);
    }
}
