
import { TRANSLATIONS, BUTTON_CONFIG, APP_MODES } from './config.js';
import { getIcon, formatBytes, timeAgo, cleanMarkdown, copyToClipboard, getPublicUrl, roundRect } from './utils.js';
import { getAppTheme, applyModalTheme } from './theme.js';
import { getState, setState } from './state.js';

// DOM Elements
const grid = document.getElementById('apps-grid');
const searchInput = document.getElementById('search-input');
const emptyState = document.getElementById('empty-state');
const toastContainer = document.getElementById('toast-container');

export function createActionButtons(app) {
    const enabledButtons = ['download', 'altstore', 'sidestore', 'livecontainer'];
    const { currentLang } = getState();
    const getLabel = (key, defaultText) => TRANSLATIONS[currentLang]?.[key] || defaultText;

    const buttons = enabledButtons.map(key => {
        const config = BUTTON_CONFIG[key];
        const label = getLabel(config.labelKey, config.defaultLabel);
        const url = config.getHref(app);
        const attrs = config.getAttrs(app);
        
        let colorClass = "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300";
        if (key === 'download') colorClass = "bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400";
        
        return `
            <a href="${url}" ${attrs} class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 ${colorClass}" title="${label}">
                ${getIcon(config.icon, 'w-4 h-4')}
                <span class="hidden xl:inline">${label}</span>
            </a>
        `;
    }).join('');
    
    return `<div class="flex gap-2 mt-4">${buttons}</div>`;
}

export function createFlatCard(app, index) {
    const { tint, accessibleColors, glowRgbLight, glowRgbDark } = getAppTheme(app);
    const { currentLang } = getState();
    const t = TRANSLATIONS[currentLang];
    
    let descSummary = app.localizedDescription || app.description || "";
    descSummary = descSummary.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/!\[[^\]]*\]\([^\)]+\)/g, '');
    if (descSummary.length > 60) descSummary = descSummary.substring(0, 60) + '...';

    return `
        <div class="group relative bg-white dark:bg-gray-900 rounded-3xl p-5 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full animate-slide-up ring-1 ring-gray-100 dark:ring-gray-800 hover:ring-2 hover:ring-primary-500/20 dark:hover:ring-primary-500/20 dynamic-app-glow group-hover:glow-active" 
             style="animation-delay: ${index * 50}ms; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); --app-glow-light: ${glowRgbLight}; --app-glow-dark: ${glowRgbDark};">
            
            <!-- Glow on Hover -->
            <div class="glow-target absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 pointer-events-none"></div>

            <div class="flex items-start justify-between mb-4 z-10">
                <div class="relative">
                     <img src="${app.iconURL}" alt="${app.name}" loading="lazy" 
                         class="w-16 h-16 rounded-[1.25rem] object-cover bg-gray-100 dark:bg-gray-800 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105"
                         style="box-shadow: 0 4px 12px -2px rgba(var(--current-glow), var(--icon-glow-opacity));">
                </div>
                
                <div class="flex flex-col items-end gap-1.5">
                     <span class="badge-dynamic-text inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-bold shadow-sm border tracking-wide uppercase"
                           title="v${app.version}"
                           style="--badge-text-light: ${accessibleColors.textLight}; --badge-text-dark: ${accessibleColors.textDark}; border-color: rgba(var(--current-glow), 0.3); background-color: rgba(var(--current-glow), 0.15); color: rgb(var(--current-text));">
                        v${app.version.length > 12 ? app.version.substring(0, 10) + '...' : app.version}
                    </span>
                    <span class="text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800/50 px-2 py-0.5 rounded-md">
                        ${formatBytes(app.size)}
                    </span>
                </div>
            </div>

            <div class="mb-4 z-10 flex-grow">
                <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight mb-1 line-clamp-1 group-hover:text-[var(--app-tint-light)] dark:group-hover:text-[var(--app-tint-dark)] transition-colors duration-300" 
                    title="${app.name}"
                    style="--app-tint-light: rgb(${accessibleColors.textLight}); --app-tint-dark: rgb(${accessibleColors.textDark});">
                    ${app.name}
                </h3>
                <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 line-clamp-1 flex items-center gap-1">
                    <svg class="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    ${app.developerName}
                </p>
                ${descSummary ? `<p class="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 leading-relaxed">${descSummary}</p>` : ''}
            </div>

            <div class="mt-auto space-y-3 z-10">
                <div class="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-3 mb-1">
                     <button onclick="window.openModal('${app.bundleIdentifier}')" class="group/btn py-1 flex items-center gap-1 transition-colors"
                             style="color: rgba(var(--current-text), 0.7); --hover-color: rgb(var(--current-text));"
                             onmouseover="this.style.color='var(--hover-color)'"
                             onmouseout="this.style.color='rgba(var(--current-text), 0.7)'">
                        <span class="bg-gray-100 dark:bg-gray-800 p-1 rounded-md group-hover/btn:bg-[rgba(var(--current-glow),0.1)] transition-colors">
                            <svg class="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </span>
                        <span class="font-medium">${t.details}</span>
                    </button>
                    <span class="font-medium opacity-70" title="${new Date(app.versionDate).toLocaleDateString()}">${timeAgo(app.versionDate, currentLang)}</span>
                </div>

                <div class="flex gap-2 w-full">
                    <!-- Direct Download -->
                    <a href="${app.downloadURL}" 
                       onclick="window.handleDownloadClick(event)"
                       class="group/btn flex-1 h-10 rounded-xl flex items-center justify-center gap-0 bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 focus:bg-gray-200 dark:focus:bg-gray-700 focus:text-gray-900 dark:focus:text-gray-200 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:flex-[3] focus:flex-[3] data-[expanded=true]:flex-[3] active:scale-95 shadow-sm overflow-hidden ring-1 ring-gray-200/50 dark:ring-gray-700/50 hover:ring-gray-300 dark:hover:ring-gray-600 hover:shadow-md min-w-0"
                       title="${t.download}">
                        <svg class="w-5 h-5 flex-shrink-0 transition-transform duration-500 group-hover/btn:scale-110 group-focus/btn:scale-110 group-data-[expanded=true]/btn:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span class="max-w-0 opacity-0 group-hover/btn:max-w-[200px] group-hover/btn:opacity-100 group-hover/btn:ml-2 group-focus/btn:max-w-[200px] group-focus/btn:opacity-100 group-focus/btn:ml-2 group-data-[expanded=true]/btn:max-w-[200px] group-data-[expanded=true]/btn:opacity-100 group-data-[expanded=true]/btn:ml-2 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] whitespace-nowrap font-bold text-xs truncate">IPA</span>
                    </a>
                    
                    <!-- AltStore -->
                    <a href="altstore://install?url=${encodeURIComponent(app.downloadURL)}"
                       onclick="window.handleDownloadClick(event)"
                       class="group/btn flex-1 h-10 rounded-xl flex items-center justify-center gap-0 bg-[#00A97F]/5 text-[#00A97F] hover:bg-[#00A97F]/10 focus:bg-[#00A97F]/10 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:flex-[3] focus:flex-[3] data-[expanded=true]:flex-[3] active:scale-95 shadow-sm overflow-hidden ring-1 ring-[#00A97F]/20 hover:ring-[#00A97F]/40 hover:shadow-md min-w-0"
                       title="Install with AltStore">
                        <svg class="w-5 h-5 flex-shrink-0 transition-transform duration-500 group-hover/btn:scale-110 group-focus/btn:scale-110 group-data-[expanded=true]/btn:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="5" y="5" width="14" height="14" rx="5" transform="rotate(45 12 12)" stroke="currentColor" stroke-width="2"/>
                            <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
                        </svg>
                        <span class="max-w-0 opacity-0 group-hover/btn:max-w-[200px] group-hover/btn:opacity-100 group-hover/btn:ml-2 group-focus/btn:max-w-[200px] group-focus/btn:opacity-100 group-focus/btn:ml-2 group-data-[expanded=true]/btn:max-w-[200px] group-data-[expanded=true]/btn:opacity-100 group-data-[expanded=true]/btn:ml-2 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] whitespace-nowrap font-bold text-xs truncate">AltStore</span>
                    </a>
                    
                    <!-- SideStore -->
                    <a href="sidestore://install?url=${encodeURIComponent(app.downloadURL)}"
                       onclick="window.handleDownloadClick(event)"
                       class="group/btn flex-1 h-10 rounded-xl flex items-center justify-center gap-0 bg-[#A359FF]/5 text-[#A359FF] hover:bg-[#A359FF]/10 focus:bg-[#A359FF]/10 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:flex-[3] focus:flex-[3] data-[expanded=true]:flex-[3] active:scale-95 shadow-sm overflow-hidden ring-1 ring-[#A359FF]/20 hover:ring-[#A359FF]/40 hover:shadow-md min-w-0"
                       title="Install with SideStore">
                        <svg class="w-5 h-5 flex-shrink-0 transition-transform duration-500 group-hover/btn:scale-110 group-focus/btn:scale-110 group-data-[expanded=true]/btn:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <g stroke="none"><path d="M11.977 2.695h0.047a3.211 3.211 0 0 1 0.105 0.166 51.375 51.375 0 0 0 0.065 0.105l0.033 0.054c0.044 0.07 0.089 0.139 0.135 0.207 0.115 0.171 0.227 0.342 0.34 0.514l0.146 0.224q0.103 0.158 0.207 0.315c0.176 0.269 0.352 0.537 0.527 0.807a19.195 19.195 0 0 0 0.187 0.283l0.04 0.059q0.038 0.056 0.076 0.112l0.034 0.05 0.03 0.044C13.969 5.672 13.969 5.672 13.969 5.719h-1.031c0.004 0.296 0.004 0.296 0.008 0.592 0.004 0.377 -0.05 0.731 -0.202 1.079l-0.028 0.065C12.377 8.239 11.762 8.846 10.969 9.164c-0.123 0.047 -0.247 0.086 -0.375 0.117l-0.069 0.018c-0.306 0.068 -0.612 0.063 -0.925 0.062 -0.08 0 -0.16 0 -0.24 0.001 -0.22 0.001 -0.44 0.001 -0.66 0.002 -0.202 0 -0.404 0.001 -0.607 0.002 -0.079 0 -0.159 0.001 -0.238 0 -0.385 0 -0.74 0.001 -1.099 0.156l-0.051 0.022C6.467 9.647 6.279 9.805 6.094 9.984l-0.044 0.042c-0.354 0.37 -0.506 0.901 -0.502 1.401 0.013 0.5 0.231 0.98 0.574 1.342 0.208 0.198 0.455 0.345 0.722 0.45l0.062 0.025c0.265 0.091 0.533 0.082 0.811 0.081 0.092 0 0.184 0 0.276 0 0.179 0.001 0.358 0.001 0.537 0.001 0.227 0 0.455 0 0.682 0.001 0.105 0 0.211 0 0.316 0 0.958 0.001 1.889 0.242 2.613 0.9 0.059 0.06 0.112 0.122 0.164 0.188l0.045 0.052c0.52 0.617 0.603 1.304 0.6 2.081 0 0.101 0 0.201 0 0.302a140.203 140.203 0 0 1 -0.001 0.506 126.211 126.211 0 0 0 0 0.584q0 0.282 0 0.564 0 0.12 0 0.239 0 0.141 -0.001 0.281a14.25 14.25 0 0 0 0 0.103c0.001 0.277 -0.037 0.475 -0.197 0.701l-0.051 0.073c-0.145 0.167 -0.378 0.268 -0.594 0.285 -0.33 0.008 -0.558 -0.071 -0.802 -0.294 -0.154 -0.161 -0.246 -0.389 -0.246 -0.61l0 -0.088 0 -0.096 0 -0.101q0 -0.109 0 -0.218c0 -0.115 0 -0.23 -0.001 -0.345q-0.002 -0.49 -0.002 -0.981 0 -0.271 -0.001 -0.542 -0.001 -0.171 0 -0.342c0 -0.071 0 -0.143 -0.001 -0.214q0 -0.049 0 -0.098c0.002 -0.317 -0.071 -0.583 -0.295 -0.816 -0.351 -0.311 -0.758 -0.298 -1.199 -0.296a85.43 85.43 0 0 1 -0.185 -0.001c-0.145 -0.001 -0.29 0 -0.435 0 -0.274 0.001 -0.549 0 -0.823 -0.001 -0.089 0 -0.179 0 -0.268 0 -0.738 0.001 -1.429 -0.113 -2.082 -0.474l-0.077 -0.042C5.039 14.264 4.509 13.72 4.172 13.055l-0.022 -0.044c-0.436 -0.866 -0.53 -1.864 -0.24 -2.793C4.101 9.639 4.404 9.133 4.828 8.695l0.034 -0.036c0.46 -0.485 1.044 -0.835 1.684 -1.026l0.054 -0.016c0.407 -0.113 0.824 -0.127 1.244 -0.126 0.09 0 0.179 0 0.269 0 0.222 -0.001 0.445 -0.001 0.667 -0.001a119.672 119.672 0 0 0 0.567 -0.001c0.088 0 0.176 0 0.264 0 0.383 0.001 0.383 0.001 0.748 -0.106l0.054 -0.021c0.239 -0.098 0.418 -0.316 0.532 -0.541 0.029 -0.077 0.052 -0.154 0.07 -0.234l0.012 -0.039c0.016 -0.077 0.017 -0.154 0.019 -0.233l0.001 -0.046c0.002 -0.056 0.003 -0.112 0.004 -0.168L11.063 5.719h-1.031c0.034 -0.085 0.061 -0.144 0.109 -0.218l0.039 -0.06 0.043 -0.065 0.046 -0.07q0.051 -0.078 0.103 -0.156c0.088 -0.133 0.175 -0.266 0.263 -0.4q0.069 -0.105 0.138 -0.209a67.523 67.523 0 0 0 0.325 -0.498c0.144 -0.223 0.29 -0.445 0.436 -0.667l0.069 -0.104 0.067 -0.102a13.125 13.125 0 0 0 0.158 -0.246l0.029 -0.047a9.938 9.938 0 0 0 0.054 -0.087c0.021 -0.033 0.043 -0.065 0.066 -0.096" fill="#932DD5"/><path d="m7.447 10.473 0.064 0q0.106 0 0.212 0l0.153 0q0.211 0 0.422 0c0.152 0 0.303 0 0.455 0 0.349 0 0.698 0 1.047 -0.001q0.259 0 0.517 0a4749.188 4749.188 0 0 1 2.217 -0.001h0.056c0.599 0 1.198 0 1.797 -0.001a2193.984 2193.984 0 0 1 2.109 -0.001h0.052q0.413 0 0.827 -0.001 0.415 -0.001 0.831 0c0.15 0 0.3 0 0.45 0q0.206 0 0.412 0 0.075 0 0.149 0c0.068 0 0.135 0 0.203 0l0.058 -0.001c0.259 0.002 0.471 0.092 0.66 0.267 0.206 0.216 0.272 0.421 0.268 0.715 -0.012 0.265 -0.095 0.472 -0.281 0.664 -0.104 0.086 -0.218 0.142 -0.342 0.191l-0.061 0.025c-0.098 0.027 -0.187 0.029 -0.288 0.028l-0.063 0c-0.07 0 -0.141 0 -0.211 0q-0.076 0 -0.153 0c-0.14 0 -0.28 0 -0.42 0 -0.151 0 -0.302 0 -0.452 0 -0.278 0 -0.557 0 -0.835 0q-0.386 0 -0.772 0h-0.052l-0.208 0q-0.974 0 -1.949 0 -0.866 0 -1.731 0a3185.461 3185.461 0 0 1 -2.152 0h-0.052q-0.386 0 -0.771 0 -0.438 0 -0.877 0a240.047 240.047 0 0 0 -0.448 0q-0.205 0 -0.41 0 -0.074 0 -0.148 0 -0.101 0 -0.201 0l-0.058 0c-0.274 -0.002 -0.522 -0.099 -0.724 -0.287 -0.183 -0.202 -0.267 -0.435 -0.259 -0.705 0.02 -0.27 0.121 -0.489 0.319 -0.677 0.199 -0.156 0.392 -0.216 0.641 -0.215" fill="#932ED5"/><path d="M15.644 13.564c0.184 0.166 0.289 0.371 0.317 0.616 0.003 0.071 0.003 0.142 0.003 0.214l0 0.064q0 0.105 0 0.21l0 0.151q0 0.205 0.001 0.41l0 0.256q0 0.401 0.001 0.803 0 0.463 0.001 0.925 0.001 0.358 0.001 0.716 0 0.214 0.001 0.427 0.001 0.201 0 0.402 0 0.074 0 0.147c0.002 0.371 -0.007 0.706 -0.266 0.998 -0.201 0.195 -0.454 0.282 -0.73 0.282 -0.282 -0.005 -0.482 -0.117 -0.685 -0.308 -0.083 -0.086 -0.137 -0.173 -0.18 -0.284 -0.008 -0.02 -0.016 -0.039 -0.024 -0.06 -0.029 -0.102 -0.029 -0.195 -0.029 -0.3l0 -0.066c0 -0.073 0 -0.146 0 -0.22l0 -0.158c0 -0.143 0 -0.285 0 -0.428q0 -0.179 0 -0.357 0 -0.446 0 -0.892c0 -0.258 0 -0.516 -0.001 -0.774q-0.001 -0.398 -0.001 -0.795c0 -0.149 0 -0.297 0 -0.446q0 -0.21 0 -0.42 0 -0.077 0 -0.154a27.188 27.188 0 0 1 0 -0.21l-0.001 -0.061c0.002 -0.252 0.096 -0.459 0.27 -0.641 0.386 -0.36 0.905 -0.368 1.321 -0.049" fill="#932DD5"/><path d="M14.484 13.477c0 0.07 0 0.07 -0.059 0.133L14.367 13.664l-0.07 -0.023z" fill="#9939D6"/></g>
                        </svg>
                        <span class="max-w-0 opacity-0 group-hover/btn:max-w-[200px] group-hover/btn:opacity-100 group-hover/btn:ml-2 group-focus/btn:max-w-[200px] group-focus/btn:opacity-100 group-focus/btn:ml-2 group-data-[expanded=true]/btn:max-w-[200px] group-data-[expanded=true]/btn:opacity-100 group-data-[expanded=true]/btn:ml-2 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] whitespace-nowrap font-bold text-xs truncate">SideStore</span>
                    </a>

                    <!-- LiveContainer -->
                    <a href="livecontainer://install?url=${encodeURIComponent(app.downloadURL)}"
                       onclick="window.handleDownloadClick(event)"
                       class="group/btn flex-1 h-10 rounded-xl flex items-center justify-center gap-0 bg-[#2563EB]/5 text-[#2563EB] hover:bg-[#2563EB]/10 focus:bg-[#2563EB]/10 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:flex-[4] focus:flex-[4] data-[expanded=true]:flex-[4] active:scale-95 shadow-sm overflow-hidden ring-1 ring-[#2563EB]/20 hover:ring-[#2563EB]/40 hover:shadow-md min-w-0"
                       title="Install with LiveContainer">
                        <svg class="w-5 h-5 flex-shrink-0 transition-transform duration-500 group-hover/btn:scale-110 group-focus/btn:scale-110 group-data-[expanded=true]/btn:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="4" y="4" width="16" height="16" rx="4" stroke-width="2" stroke="currentColor"/><circle cx="12" cy="12" r="3" stroke-width="2" stroke="currentColor"/>
                        </svg>
                        <span class="max-w-0 opacity-0 group-hover/btn:max-w-[200px] group-hover/btn:opacity-100 group-hover/btn:ml-2 group-focus/btn:max-w-[200px] group-focus/btn:opacity-100 group-focus/btn:ml-2 group-data-[expanded=true]/btn:max-w-[200px] group-data-[expanded=true]/btn:opacity-100 group-data-[expanded=true]/btn:ml-2 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] whitespace-nowrap font-bold text-xs truncate">LiveContainer</span>
                    </a>
                </div>
            </div>
        </div>
    `;
}

export function renderApps() {
    const { currentApps, currentSort, currentLang } = getState();
    const query = searchInput.value.toLowerCase();
    
    let filtered = currentApps.filter(app => 
        app.name.toLowerCase().includes(query) || 
        (app.developerName && app.developerName.toLowerCase().includes(query)) ||
        (app.bundleIdentifier && app.bundleIdentifier.toLowerCase().includes(query)) ||
        (app.localizedDescription && app.localizedDescription.toLowerCase().includes(query))
    );

    filtered.sort((a, b) => {
        switch(currentSort) {
            case 'date': return new Date(b.versionDate) - new Date(a.versionDate);
            case 'name': return a.name.localeCompare(b.name);
            case 'size': return b.size - a.size;
            default: return 0;
        }
    });

    if (filtered.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    
    // Choose Builder
    const builder = createFlatCard;
    grid.innerHTML = filtered.map((app, index) => builder(app, index)).join('');
}

export function updateLanguage(lang) {
    setState('currentLang', lang);
    const t = TRANSLATIONS[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });
    if(searchInput) searchInput.placeholder = t.searchPlaceholder;
    
    const { currentSource, currentApps } = getState();
    updateSourceUI(currentSource);
    if (currentApps.length > 0) renderApps();
}

export function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border backdrop-blur-md animate-slide-up transform transition-all duration-300 ${
        type === 'success' 
        ? 'bg-white/90 dark:bg-gray-800/90 border-green-200 dark:border-green-900 text-green-700 dark:text-green-400' 
        : 'bg-white/90 dark:bg-gray-800/90 border-red-200 dark:border-red-900 text-red-700 dark:text-red-400'
    }`;
    const icon = type === 'success' ? getIcon('check', 'w-5 h-5') : getIcon('close', 'w-5 h-5');
    toast.innerHTML = `${icon}<span class="text-sm font-medium">${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

export function copySourceURL(specificSource = null) {
    const { currentSource, currentLang } = getState();
    const targetMode = specificSource || currentSource;
    const key = (targetMode === 'all') ? 'standard' : targetMode;
    const fullUrl = getPublicUrl(APP_MODES[key]?.path || APP_MODES['standard'].path);
    const t = TRANSLATIONS[currentLang];
    const name = t[APP_MODES[key].labelKey];
    copyToClipboard(fullUrl, `${name} ${t.sourceCopied}`, t.copyFailed, showToast);
}

export function updateSourceUI(activeKey) {
    const track = document.getElementById('source-label-track');
    const mode = APP_MODES[activeKey];
    if (track && mode) {
        track.style.transform = `translateY(${mode.uiOffset}px)`;
        updateCopyButtonUI(activeKey);
    }
}

export function updateCopyButtonUI(mode) {
    const wrapper = document.getElementById('copy-btn-wrapper');
    if (!wrapper) return;
    wrapper.style.transform = 'scale(1)';
    wrapper.style.opacity = '1';

    if (mode === 'all') {
        wrapper.className = "flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ease-out flex-shrink-0 min-w-[40px]";
        const btnClass = 'hover:bg-emerald-50 dark:hover:bg-emerald-900/30';
        const btnClass2 = 'hover:bg-pink-50 dark:hover:bg-pink-900/30';
        
        wrapper.innerHTML = `
            <button onclick="window.copySourceURL('standard')" class="p-1.5 rounded-lg text-emerald-500 ${btnClass} transition-all active:scale-95 group/std" title="Copy Standard Source" style="animation: split-up 0.3s ease-out forwards;">${getIcon('copy', 'w-4 h-4')}</button>
            <button onclick="window.copySourceURL('nsfw')" class="p-1.5 rounded-lg text-pink-500 ${btnClass2} transition-all active:scale-95 group/nsfw" title="Copy NSFW Source" style="animation: split-down 0.3s ease-out forwards;">${getIcon('copy', 'w-4 h-4')}</button>
        `;
    } else {
        wrapper.className = "flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ease-out flex-shrink-0 min-w-[40px]";
        // Standard (or others) now gets colored by default (Emerald) instead of gray
        let colorClass = mode === 'nsfw' 
            ? 'text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/30' 
            : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30';
        
        wrapper.innerHTML = `<button onclick="window.copySourceURL('${mode}')" class="p-2 rounded-xl ${colorClass} transition-all active:scale-95" title="Copy Source URL">${getIcon('copy', 'w-5 h-5')}</button>`;
    }
}

export function updateHeaderIcon(sourceKey) {
    const mode = APP_MODES[sourceKey];
    ['icon-standard', 'icon-nsfw', 'icon-all'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === mode.iconId) el.classList.remove('hidden');
            else el.classList.add('hidden');
        }
    });
}

export function updateFavicon(sourceKey) {
    const mode = APP_MODES[sourceKey];
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return; // Safety check
    ctx.fillStyle = mode.themeColor;
    ctx.clearRect(0, 0, 64, 64);
    ctx.beginPath();
    roundRect(ctx, 0, 0, 64, 64, 14);
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.fillStyle = 'none';
    ctx.save();
    ctx.translate(32, 32); ctx.scale(1.6, 1.6); ctx.translate(-12, -12);
    const p = new Path2D(mode.faviconPath);
    ctx.stroke(p);
    ctx.restore();
    link.href = canvas.toDataURL();
}

// Modal Logic
export function openModal(identifier) {
    const { currentApps, currentLang } = getState();
    const app = currentApps.find(a => a.bundleIdentifier === identifier || a.name === identifier);
    if (!app) return;
    const theme = getAppTheme(app);
    applyModalTheme(theme);
    renderModalHeader(app);
    document.getElementById('modal-meta-grid').innerHTML = buildModalMeta(app, currentLang);
    document.getElementById('modal-content').innerHTML = buildModalContent(app, currentLang);
    document.getElementById('modal-footer').innerHTML = buildModalFooter(currentLang);
    
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalPanel = document.getElementById('modal-panel');
    const modalContentPanel = modalPanel.querySelector('div');

    modalBackdrop.classList.remove('hidden');
    modalPanel.classList.remove('hidden');
    requestAnimationFrame(() => {
        modalBackdrop.classList.remove('opacity-0');
        modalContentPanel.classList.remove('scale-95', 'opacity-0');
        modalContentPanel.classList.add('scale-100', 'opacity-100');
    });
    document.body.style.overflow = 'hidden';
}

export function closeModal() {
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalPanel = document.getElementById('modal-panel');
    const modalContentPanel = modalPanel.querySelector('div');
    modalBackdrop.classList.add('opacity-0');
    modalContentPanel.classList.remove('scale-100', 'opacity-100');
    modalContentPanel.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        modalBackdrop.classList.add('hidden');
        modalPanel.classList.add('hidden');
        document.body.style.overflow = '';
    }, 300);
}

function renderModalHeader(app) {
    const modalTitle = document.getElementById('modal-title');
    const modalVersionBadge = document.getElementById('modal-version-badge');
    const modalSize = document.getElementById('modal-size');
    const modalIcon = document.getElementById('modal-icon');

    modalTitle.textContent = app.name;
    modalTitle.className = "text-2xl font-bold leading-tight mb-1 text-[var(--modal-tint-light)] dark:text-[var(--modal-tint-dark)] transition-colors duration-300";
    
    modalVersionBadge.textContent = `v${app.version.length > 12 ? app.version.substring(0, 10) + '...' : app.version}`;
    modalVersionBadge.title = `v${app.version}`;
    modalVersionBadge.style.cssText = `background-color: rgba(var(--current-modal-glow), 0.15); color: rgb(var(--current-modal-text)); border-color: rgba(var(--current-modal-glow), 0.3);`;
    modalSize.textContent = formatBytes(app.size);
    modalIcon.src = app.iconURL;
    modalIcon.className = "w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 object-cover shadow-sm modal-icon-shadow-glow";
}

function buildModalMeta(app, currentLang) {
    const t = TRANSLATIONS[currentLang];
    let html = `<div class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800 ${app.minOSVersion ? '' : 'col-span-2'}">
            <div class="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">${t.bundleId}</div>
            <div class="text-xs font-mono text-gray-600 dark:text-gray-300 break-all select-all">${app.bundleIdentifier}</div>
        </div>`;
    if (app.minOSVersion) html += `<div class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
            <div class="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">${t.minOs}</div>
            <div class="text-xs font-medium text-gray-600 dark:text-gray-300">${app.minOSVersion}</div>
        </div>`;
    if (app.versionDate) html += `<div class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
            <div class="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">${t.updated}</div>
            <div class="text-xs font-medium text-gray-600 dark:text-gray-300">${new Date(app.versionDate).toLocaleDateString()}</div>
        </div>`;
    if (app.developerName && app.developerName !== app.name) html += `<div class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
            <div class="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">${t.developer}</div>
            <div class="text-xs font-medium text-gray-600 dark:text-gray-300 truncate">${app.developerName}</div>
        </div>`;
    return html;
}

function buildModalContent(app, currentLang) {
    const t = TRANSLATIONS[currentLang];
    const desc = app.localizedDescription || app.description || t.noDescription;
    const changelog = app.versionDescription || t.noChangelog;
    let html = `<div class="mb-8">
            <h4 class="text-xs font-bold uppercase tracking-wider mb-3 opacity-70" style="color: rgb(var(--current-modal-text))">${t.description}</h4>
            <div class="markdown-body text-sm bg-transparent leading-relaxed text-gray-600 dark:text-gray-300">${marked.parse(cleanMarkdown(desc), { breaks: true, gfm: true })}</div>
        </div>`;
    if (changelog && changelog !== t.noChangelog) html += `<div class="mb-4 pt-6 border-t border-gray-100 dark:border-gray-800">
            <h4 class="text-xs font-bold uppercase tracking-wider mb-3 opacity-70" style="color: rgb(var(--current-modal-text))">${t.whatsNew}</h4>
            <div class="markdown-body text-sm bg-transparent leading-relaxed text-gray-600 dark:text-gray-300">${marked.parse(cleanMarkdown(changelog), { breaks: true, gfm: true })}</div>
        </div>`;
    return html;
}

function buildModalFooter(currentLang) {
    const t = TRANSLATIONS[currentLang];
    return `<button onclick="window.closeModal()" class="w-full py-3.5 rounded-xl font-bold shadow-sm active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"><span>${t.close}</span></button>`;
}

export function collapseAllExpanded() {
    document.querySelectorAll('[data-expanded="true"]').forEach(el => delete el.dataset.expanded);
}

export function handleDownloadClick(e) {
    const { isMobile } = window;
    if (typeof isMobile === 'function' && !isMobile()) return;
    const btn = e.currentTarget;
    const isExpanded = btn.dataset.expanded === 'true';
    if (!isExpanded) {
        e.preventDefault();
        e.stopPropagation();
        collapseAllExpanded();
        btn.dataset.expanded = 'true';
        if (navigator.vibrate) navigator.vibrate(10);
    } else {
        if (navigator.vibrate) navigator.vibrate(20);
        setTimeout(() => delete btn.dataset.expanded, 1000);
    }
}
