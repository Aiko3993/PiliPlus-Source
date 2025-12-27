
// Base config for paths
export const PATH_CONFIG = {
    // Detect if we are in the local development structure (inside /website/)
    isLocalDev: window.location.pathname.includes('/website/'),
    productionBase: 'https://raw.githubusercontent.com/Aiko3993/iOS-Sideload-Source/gh-pages/'
};

export const TRANSLATIONS = {
    en: {
        title: "Aiko3993's",
        sourceTitle: "Sideload Source",
        subtitle: "Supports AltStore, SideStore & LiveContainer",
        searchPlaceholder: "Search...",
        sourceAll: "All Apps",
        sourceAllDesc: "All available apps",
        sourceStandard: "Standard",
        sourceStandardDesc: "Normal apps",
        sourceNSFW: "NSFW",
        sourceNSFWDesc: "Adult content",
        sortLatest: "Latest",
        sortName: "Name",
        sortSize: "Size",
        noApps: "No apps found",
        noAppsDesc: "Try adjusting your search or switching sources.",
        download: "Download IPA",
        details: "Details",
        copyBtn: "Copy Source URL",
        sourceCopied: "source URL copied!",
        copyFailed: "Failed to copy URL",
        thirdParty: "Third-party Source",
        close: "Close",
        whatsNew: "What's New",
        description: "Description",
        installAltStore: "AltStore",
        installSideStore: "SideStore",
        installLiveContainer: "LiveContainer",
        ipa: "IPA",
        bundleId: "Bundle ID",
        minOs: "Min OS",
        updated: "Updated",
        developer: "Developer",
        linkCopiedFor: "Link copied for",
        failedToCopy: "Failed to copy",
        riskWarning: "Third-party Source",
        riskOwnRisk: "Use at your own risk",
        loadFailedTitle: "Failed to load source",
        loadFailedDesc: "Could not load apps. Please check your internet connection or try again later.",
        retry: "Retry",
        noDescription: "No description available.",
        noChangelog: "No changelog available."
    },
    zh: {
        title: "Aiko3993 的",
        sourceTitle: "iOS 侧载源",
        subtitle: "支持 AltStore, SideStore & LiveContainer",
        searchPlaceholder: "搜索应用...",
        sourceAll: "全部应用",
        sourceAllDesc: "所有可用应用",
        sourceStandard: "标准",
        sourceStandardDesc: "常用应用",
        sourceNSFW: "NSFW",
        sourceNSFWDesc: "成人内容",
        sortLatest: "最新",
        sortName: "名称",
        sortSize: "大小",
        noApps: "未找到应用",
        noAppsDesc: "尝试调整搜索关键词或切换源。",
        download: "下载 IPA",
        details: "详情",
        copyBtn: "拷贝源地址",
        sourceCopied: "源地址已拷贝！",
        copyFailed: "拷贝失败",
        thirdParty: "第三方源",
        close: "关闭",
        whatsNew: "更新日志",
        description: "应用介绍",
        installAltStore: "AltStore",
        installSideStore: "SideStore",
        installLiveContainer: "LiveContainer",
        ipa: "IPA",
        bundleId: "包名",
        minOs: "最低系统",
        updated: "更新时间",
        developer: "开发者",
        linkCopiedFor: "已拷贝链接：",
        failedToCopy: "拷贝失败",
        riskWarning: "第三方源",
        riskOwnRisk: "后果自负",
        loadFailedTitle: "无法加载源",
        loadFailedDesc: "无法加载应用列表，请检查您的网络连接或稍后重试。",
        retry: "重试",
        noDescription: "暂无描述。",
        noChangelog: "暂无更新日志。"
    }
};

// Icons
export const ICONS = {
    standard: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />',
    nsfw: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>',
    all: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>',
    search: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>',
    copy: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>',
    sortLatest: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
    sortName: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>',
    sortSize: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>',
    noApps: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
    warning: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>',
    arrowUp: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>',
    close: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>',
    check: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>',
    developer: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>',
    details: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
    download: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />',
    altstore: '<rect x="5" y="5" width="14" height="14" rx="5" transform="rotate(45 12 12)" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/>',
    sidestore: '<g stroke="none"><path d="M11.977 2.695h0.047a3.211 3.211 0 0 1 0.105 0.166 51.375 51.375 0 0 0 0.065 0.105l0.033 0.054c0.044 0.07 0.089 0.139 0.135 0.207 0.115 0.171 0.227 0.342 0.34 0.514l0.146 0.224q0.103 0.158 0.207 0.315c0.176 0.269 0.352 0.537 0.527 0.807a19.195 19.195 0 0 0 0.187 0.283l0.04 0.059q0.038 0.056 0.076 0.112l0.034 0.05 0.03 0.044C13.969 5.672 13.969 5.672 13.969 5.719h-1.031c0.004 0.296 0.004 0.296 0.008 0.592 0.004 0.377 -0.05 0.731 -0.202 1.079l-0.028 0.065C12.377 8.239 11.762 8.846 10.969 9.164c-0.123 0.047 -0.247 0.086 -0.375 0.117l-0.069 0.018c-0.306 0.068 -0.612 0.063 -0.925 0.062 -0.08 0 -0.16 0 -0.24 0.001 -0.22 0.001 -0.44 0.001 -0.66 0.002 -0.202 0 -0.404 0.001 -0.607 0.002 -0.079 0 -0.159 0.001 -0.238 0 -0.385 0 -0.74 0.001 -1.099 0.156l-0.051 0.022C6.467 9.647 6.279 9.805 6.094 9.984l-0.044 0.042c-0.354 0.37 -0.506 0.901 -0.502 1.401 0.013 0.5 0.231 0.98 0.574 1.342 0.208 0.198 0.455 0.345 0.722 0.45l0.062 0.025c0.265 0.091 0.533 0.082 0.811 0.081 0.092 0 0.184 0 0.276 0 0.179 0.001 0.358 0.001 0.537 0.001 0.227 0 0.455 0 0.682 0.001 0.105 0 0.211 0 0.316 0 0.958 0.001 1.889 0.242 2.613 0.9 0.059 0.06 0.112 0.122 0.164 0.188l0.045 0.052c0.52 0.617 0.603 1.304 0.6 2.081 0 0.101 0 0.201 0 0.302a140.203 140.203 0 0 1 -0.001 0.506 126.211 126.211 0 0 0 0 0.584q0 0.282 0 0.564 0 0.12 0 0.239 0 0.141 -0.001 0.281a14.25 14.25 0 0 0 0 0.103c0.001 0.277 -0.037 0.475 -0.197 0.701l-0.051 0.073c-0.145 0.167 -0.378 0.268 -0.594 0.285 -0.33 0.008 -0.558 -0.071 -0.802 -0.294 -0.154 -0.161 -0.246 -0.389 -0.246 -0.61l0 -0.088 0 -0.096 0 -0.101q0 -0.109 0 -0.218c0 -0.115 0 -0.23 -0.001 -0.345q-0.002 -0.49 -0.002 -0.981 0 -0.271 -0.001 -0.542 -0.001 -0.171 0 -0.342c0 -0.071 0 -0.143 -0.001 -0.214q0 -0.049 0 -0.098c0.002 -0.317 -0.071 -0.583 -0.295 -0.816 -0.351 -0.311 -0.758 -0.298 -1.199 -0.296a85.43 85.43 0 0 1 -0.185 -0.001c-0.145 -0.001 -0.29 0 -0.435 0 -0.274 0.001 -0.549 0 -0.823 -0.001 -0.089 0 -0.179 0 -0.268 0 -0.738 0.001 -1.429 -0.113 -2.082 -0.474l-0.077 -0.042C5.039 14.264 4.509 13.72 4.172 13.055l-0.022 -0.044c-0.436 -0.866 -0.53 -1.864 -0.24 -2.793C4.101 9.639 4.404 9.133 4.828 8.695l0.034 -0.036c0.46 -0.485 1.044 -0.835 1.684 -1.026l0.054 -0.016c0.407 -0.113 0.824 -0.127 1.244 -0.126 0.09 0 0.179 0 0.269 0 0.222 -0.001 0.445 -0.001 0.667 -0.001a119.672 119.672 0 0 0 0.567 -0.001c0.088 0 0.176 0 0.264 0 0.383 0.001 0.383 0.001 0.748 -0.106l0.054 -0.021c0.239 -0.098 0.418 -0.316 0.532 -0.541 0.029 -0.077 0.052 -0.154 0.07 -0.234l0.012 -0.039c0.016 -0.077 0.017 -0.154 0.019 -0.233l0.001 -0.046c0.002 -0.056 0.003 -0.112 0.004 -0.168L11.063 5.719h-1.031c0.034 -0.085 0.061 -0.144 0.109 -0.218l0.039 -0.06 0.043 -0.065 0.046 -0.07q0.051 -0.078 0.103 -0.156c0.088 -0.133 0.175 -0.266 0.263 -0.4q0.069 -0.105 0.138 -0.209a67.523 67.523 0 0 0 0.325 -0.498c0.144 -0.223 0.29 -0.445 0.436 -0.667l0.069 -0.104 0.067 -0.102a13.125 13.125 0 0 0 0.158 -0.246l0.029 -0.047a9.938 9.938 0 0 0 0.054 -0.087c0.021 -0.033 0.043 -0.065 0.066 -0.096" fill="#932DD5"/><path d="m7.447 10.473 0.064 0q0.106 0 0.212 0l0.153 0q0.211 0 0.422 0c0.152 0 0.303 0 0.455 0 0.349 0 0.698 0 1.047 -0.001q0.259 0 0.517 0a4749.188 4749.188 0 0 1 2.217 -0.001h0.056c0.599 0 1.198 0 1.797 -0.001a2193.984 2193.984 0 0 1 2.109 -0.001h0.052q0.413 0 0.827 -0.001 0.415 -0.001 0.831 0c0.15 0 0.3 0 0.45 0q0.206 0 0.412 0 0.075 0 0.149 0c0.068 0 0.135 0 0.203 0l0.058 -0.001c0.259 0.002 0.471 0.092 0.66 0.267 0.206 0.216 0.272 0.421 0.268 0.715 -0.012 0.265 -0.095 0.472 -0.281 0.664 -0.104 0.086 -0.218 0.142 -0.342 0.191l-0.061 0.025c-0.098 0.027 -0.187 0.029 -0.288 0.028l-0.063 0c-0.07 0 -0.141 0 -0.211 0q-0.076 0 -0.153 0c-0.14 0 -0.28 0 -0.42 0 -0.151 0 -0.302 0 -0.452 0 -0.278 0 -0.557 0 -0.835 0q-0.386 0 -0.772 0h-0.052l-0.208 0q-0.974 0 -1.949 0 -0.866 0 -1.731 0a3185.461 3185.461 0 0 1 -2.152 0h-0.052q-0.386 0 -0.771 0 -0.438 0 -0.877 0a240.047 240.047 0 0 0 -0.448 0q-0.205 0 -0.41 0 -0.074 0 -0.148 0 -0.101 0 -0.201 0l-0.058 0c-0.274 -0.002 -0.522 -0.099 -0.724 -0.287 -0.183 -0.202 -0.267 -0.435 -0.259 -0.705 0.02 -0.27 0.121 -0.489 0.319 -0.677 0.199 -0.156 0.392 -0.216 0.641 -0.215" fill="#932ED5"/><path d="M15.644 13.564c0.184 0.166 0.289 0.371 0.317 0.616 0.003 0.071 0.003 0.142 0.003 0.214l0 0.064q0 0.105 0 0.21l0 0.151q0 0.205 0.001 0.41l0 0.256q0 0.401 0.001 0.803 0 0.463 0.001 0.925 0.001 0.358 0.001 0.716 0 0.214 0.001 0.427 0.001 0.201 0 0.402 0 0.074 0 0.147c0.002 0.371 -0.007 0.706 -0.266 0.998 -0.201 0.195 -0.454 0.282 -0.73 0.282 -0.282 -0.005 -0.482 -0.117 -0.685 -0.308 -0.083 -0.086 -0.137 -0.173 -0.18 -0.284 -0.008 -0.02 -0.016 -0.039 -0.024 -0.06 -0.029 -0.102 -0.029 -0.195 -0.029 -0.3l0 -0.066c0 -0.073 0 -0.146 0 -0.22l0 -0.158c0 -0.143 0 -0.285 0 -0.428q0 -0.179 0 -0.357 0 -0.446 0 -0.892c0 -0.258 0 -0.516 -0.001 -0.774q-0.001 -0.398 -0.001 -0.795c0 -0.149 0 -0.297 0 -0.446q0 -0.21 0 -0.42 0 -0.077 0 -0.154a27.188 27.188 0 0 1 0 -0.21l-0.001 -0.061c0.002 -0.252 0.096 -0.459 0.27 -0.641 0.386 -0.36 0.905 -0.368 1.321 -0.049" fill="#932DD5"/><path d="M14.484 13.477c0 0.07 0 0.07 -0.059 0.133L14.367 13.664l-0.07 -0.023z" fill="#9939D6"/></g>',
    livecontainer: '<rect x="4" y="4" width="16" height="16" rx="4" stroke-width="2" stroke="currentColor"/><circle cx="12" cy="12" r="3" stroke-width="2" stroke="currentColor"/>',
    error: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>'
};

export const APP_MODES = {
    standard: {
        path: 'sources/standard/source.json',
        labelKey: 'sourceStandard',
        nextMode: 'nsfw',
        theme: 'standard',
        themeColor: '#10b981',
        iconId: 'icon-standard',
        uiOffset: -24,
        faviconPath: "M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
    },
    nsfw: {
        path: 'sources/nsfw/source.json',
        labelKey: 'sourceNSFW',
        nextMode: 'all',
        theme: 'nsfw',
        themeColor: '#db2777',
        iconId: 'icon-nsfw',
        uiOffset: -48,
        faviconPath: "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
    },
    all: {
        path: null,
        labelKey: 'sourceAll',
        nextMode: 'standard',
        theme: 'all',
        themeColor: '#2563eb',
        iconId: 'icon-all',
        uiOffset: 0,
        faviconPath: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
    }
};

export const BUTTON_CONFIG = {
    download: {
        labelKey: 'ipa',
        defaultLabel: 'IPA',
        icon: 'download',
        getHref: (app) => app.downloadURL,
        getAttrs: (app) => `download="${app.name}.ipa" onclick="window.handleDownloadClick(event)"`,
    },
    altstore: {
        labelKey: 'installAltStore',
        defaultLabel: 'AltStore',
        icon: 'altstore',
        getHref: (app) => `altstore://install?url=${encodeURIComponent(app.downloadURL)}`,
        getAttrs: () => `onclick="window.handleDownloadClick(event)"`,
    },
    sidestore: {
        labelKey: 'installSideStore',
        defaultLabel: 'SideStore',
        icon: 'sidestore',
        getHref: (app) => `sidestore://install?url=${encodeURIComponent(app.downloadURL)}`,
        getAttrs: () => `onclick="window.handleDownloadClick(event)"`,
    },
    livecontainer: {
        labelKey: 'installLiveContainer',
        defaultLabel: 'LiveContainer',
        icon: 'livecontainer',
        getHref: (app) => `livecontainer://install?url=${encodeURIComponent(app.downloadURL)}`,
        getAttrs: (app) => `onclick="window.handleDownloadClick(event)"`,
    }
};

export const SORT_MODES = ['date', 'name', 'size'];
export const SORT_MAP = { 'date': 0, 'name': 1, 'size': 2 };
