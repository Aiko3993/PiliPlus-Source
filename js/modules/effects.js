
import { getState } from './state.js';
import { getIcon } from './utils.js';

let eggClickCount = 0;
let eggTimer = null;

export function initCheatCodes() {
    let konamiSeq = [];
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    const vimCode = ['k', 'k', 'j', 'j', 'h', 'l', 'h', 'l', 'b', 'a'];

    document.addEventListener('keydown', (e) => {
        // Normalize key (handle case insensitivity for 'b', 'a')
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

        // Add to sequence
        konamiSeq.push(key);

        // Trim sequence to max length
        if (konamiSeq.length > 10) {
            konamiSeq.shift();
        }

        // Check Match
        const matchKonami = konamiSeq.every((k, i) => k === konamiCode[i] || (konamiCode[i].length === 1 && k === konamiCode[i]));
        const matchVim = konamiSeq.every((k, i) => k === vimCode[i]);

        if (konamiSeq.length === 10 && (matchKonami || matchVim)) {
            playKonamiEntry();
            konamiSeq = []; // Reset
        }
    });
}

function playKonamiEntry() {
    // 1. Flash Overlay (Removed per user request for safety)
    // const flash = document.createElement('div');
    // flash.className = 'fixed inset-0 bg-white z-[10000] animate-flash pointer-events-none mix-blend-difference';
    // document.body.appendChild(flash);

    // 2. Retro Text Container (Flexbox for perfect centering, avoids transform conflict with animate-bounce)
    const container = document.createElement('div');
    container.className = 'fixed inset-0 z-[10001] flex items-center justify-center pointer-events-none';
    document.body.appendChild(container);

    const text = document.createElement('div');
    // Responsive text size: text-3xl (mobile) -> text-5xl (tablet) -> text-7xl (desktop)
    text.className = 'px-4 text-center text-3xl sm:text-5xl md:text-7xl font-black text-green-500 font-mono animate-bounce drop-shadow-[0_0_15px_rgba(34,197,94,0.8)] break-words max-w-full';
    text.innerText = "CHEAT CODE ACTIVATED";
    container.appendChild(text);

    // 3. Sound Effect (Simulated visually via shake)
    document.body.classList.add('animate-shake');

    setTimeout(() => {
        // flash.remove(); 
        container.remove(); // Remove the wrapper
        document.body.classList.remove('animate-shake');
        openDeveloperConsole();
    }, 1500);
}

export function showDeveloperConsolePrompt() {
    const searchInput = document.getElementById('search-input');
    // Prevent duplicate toasts
    const existingToast = document.getElementById('debug-prompt-toast');
    if (existingToast) existingToast.remove();

    // Show a toast or small prompt asking if they want to enter developer mode
    const toast = document.createElement('div');
    toast.id = 'debug-prompt-toast';
    // Position absolute relative to the search container, but centered and fixed width
    toast.className = `absolute top-full left-0 right-0 mx-auto mt-2 z-50 flex flex-col items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border border-green-500/30 backdrop-blur-xl animate-slide-up bg-black/90 text-green-400 font-mono w-max min-w-[280px]`;

    toast.innerHTML = `
        <div class="text-sm font-bold flex items-center gap-2">
            <span>> DETECTED_DEBUG_SEQUENCE</span>
            <span class="animate-pulse">_</span>
        </div>
        <div class="text-xs opacity-80">Initialize Developer Console?</div>
        <div class="flex gap-3 mt-2 w-full">
            <button id="dev-yes" class="flex-1 py-1.5 bg-green-500/20 hover:bg-green-500/40 border border-green-500/50 rounded text-xs font-bold transition-colors">CONFIRM</button>
            <button id="dev-no" class="flex-1 py-1.5 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 rounded text-xs font-bold transition-colors text-red-400">ABORT</button>
        </div>
    `;

    // Append to the search input's parent container for correct positioning
    searchInput.parentElement.appendChild(toast);

    // Auto remove after 5s
    const timer = setTimeout(() => {
        if (document.body.contains(toast)) toast.remove();
    }, 5000);

    document.getElementById('dev-yes').onclick = () => {
        clearTimeout(timer);
        toast.remove();
        openDeveloperConsole();
    };

    document.getElementById('dev-no').onclick = () => {
        clearTimeout(timer);
        toast.remove();
    };
}

export function openDeveloperConsole() {
    const { currentSource } = getState();
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[9999] bg-black/95 text-green-500 font-mono p-4 flex flex-col animate-fade-in overflow-hidden';

    const effects = [
        'emoji-rain', 'matrix-rain', 'spin-madness',
        'ascii-tux', 'retro-terminal', 'warp-speed',
        'fireworks', 'retro-pong', 'element-eater'
    ];

    // Add ascii-waifu ONLY if in NSFW mode, and REMOVE ascii-tux
    if (currentSource === 'nsfw') {
        // Remove ascii-tux
        const tuxIndex = effects.indexOf('ascii-tux');
        if (tuxIndex > -1) effects.splice(tuxIndex, 1);

        // Add waifu (insert at same position or append)
        effects.splice(tuxIndex > -1 ? tuxIndex : effects.length, 0, 'ascii-waifu');
    }

    // Default Config
    const devConfig = {
        duration: 5000,
        autoDismiss: true,
        gravity: 1.0,
        speed: 1.0,
        scale: 1.0
    };

    overlay.innerHTML = `
        <div class="flex justify-between items-center border-b border-green-500/30 pb-4 mb-4">
            <h2 class="text-xl font-bold flex items-center gap-2">
                <span>> DEV_CONSOLE</span>
                <span class="w-3 h-5 bg-green-500 animate-pulse inline-block"></span>
            </h2>
            <button id="dev-close" class="text-red-500 hover:text-red-400 font-bold">[EXIT]</button>
        </div>
        
        <div class="flex-grow overflow-y-auto custom-scrollbar">
            <!-- Settings Section -->
            <div class="mb-6 border-b border-green-500/30 pb-6">
                <h3 class="text-xs font-bold text-green-400 opacity-70 mb-3 uppercase tracking-wider">> RUNTIME CONFIGURATION</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div class="flex flex-col gap-1">
                        <label class="opacity-80">DURATION (MS)</label>
                        <input type="number" id="cfg-duration" value="${devConfig.duration}" class="bg-black/50 border border-green-500/30 text-green-400 px-2 py-1 rounded focus:border-green-500 outline-none">
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="opacity-80">GRAVITY (0.1 - 5.0)</label>
                        <input type="number" id="cfg-gravity" step="0.1" value="${devConfig.gravity}" class="bg-black/50 border border-green-500/30 text-green-400 px-2 py-1 rounded focus:border-green-500 outline-none">
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="opacity-80">SPEED (0.1 - 5.0)</label>
                        <input type="number" id="cfg-speed" step="0.1" value="${devConfig.speed}" class="bg-black/50 border border-green-500/30 text-green-400 px-2 py-1 rounded focus:border-green-500 outline-none">
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="opacity-80">SCALE (0.5 - 3.0)</label>
                        <input type="number" id="cfg-scale" step="0.1" value="${devConfig.scale}" class="bg-black/50 border border-green-500/30 text-green-400 px-2 py-1 rounded focus:border-green-500 outline-none">
                    </div>
                </div>
                <div class="flex items-center gap-2 mt-4">
                    <input type="checkbox" id="cfg-autodismiss" checked class="accent-green-500">
                    <label for="cfg-autodismiss" class="cursor-pointer select-none">AUTO DISMISS</label>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${effects.map(effect => `
                    <button class="dev-effect-btn text-left p-4 border border-green-500/30 hover:bg-green-500/10 hover:border-green-500 rounded-lg transition-all group relative overflow-hidden" data-effect="${effect}">
                        <div class="absolute inset-0 bg-green-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <div class="relative z-10 font-bold text-sm uppercase tracking-wider mb-1">./run ${effect}</div>
                        <div class="relative z-10 text-[10px] opacity-60">Execute ${effect} sequence</div>
                    </button>
                `).join('')}
            </div>
            
            <div class="mt-8 border-t border-green-500/30 pt-4 text-xs opacity-50">
                <p>> SYSTEM STATUS: ONLINE</p>
                <p>> MEMORY: ${Math.round(performance.memory ? performance.memory.usedJSHeapSize / 1048576 : 0)}MB USED</p>
                <p>> USER_AGENT: ${navigator.userAgent}</p>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Handlers
    document.getElementById('dev-close').onclick = () => overlay.remove();

    // Config Listeners
    const durationInput = document.getElementById('cfg-duration');
    const gravityInput = document.getElementById('cfg-gravity');
    const speedInput = document.getElementById('cfg-speed');
    const scaleInput = document.getElementById('cfg-scale');
    const dismissCheck = document.getElementById('cfg-autodismiss');

    // Override triggerConfetti to inject config
    const originalTrigger = triggerConfetti;
    // We can't easily override the export, but we can pass config if we modify triggerConfetti signature
    // OR we can rely on triggerConfetti being in the same module scope if we promote devConfig.
    // However, triggerConfetti is exported.

    overlay.querySelectorAll('.dev-effect-btn').forEach(btn => {
        btn.onclick = () => {
            const effect = btn.dataset.effect;

            // Read latest config
            const config = {
                duration: parseInt(durationInput.value) || 5000,
                autoDismiss: dismissCheck.checked,
                gravity: parseFloat(gravityInput.value) || 1.0,
                speed: parseFloat(speedInput.value) || 1.0,
                scale: parseFloat(scaleInput.value) || 1.0
            };

            overlay.remove();
            if (effect === 'element-eater') {
                triggerElementEater();
            } else {
                triggerConfetti(effect, config); // Pass config
            }
        };
    });
}

export function handleEasterEgg() {
    const { currentSource } = getState();
    const { isMobile } = window;
    clearTimeout(eggTimer);
    eggClickCount++;

    const pingDot = document.getElementById('status-dot-ping');
    const coreDot = document.getElementById('status-dot-core');
    const wrapper = document.getElementById('status-dot-wrapper');

    if (pingDot && coreDot && wrapper) {
        // Turn Red Immediately (Remove Green/Yellow)
        pingDot.classList.remove('bg-green-400', 'group-hover:bg-yellow-400');
        pingDot.classList.add('bg-red-500');

        coreDot.classList.remove('bg-green-500', 'group-hover:bg-yellow-500');
        coreDot.classList.add('bg-red-600');

        // Trigger limit (reduced for mobile)
        const limit = (typeof isMobile === 'function' && isMobile()) ? 5 : 10;

        // Trigger at limit
        if (eggClickCount >= limit) {
            let effects = [
                'emoji-rain', 'matrix-rain', 'spin-madness',
                'ascii-tux', 'retro-terminal', 'warp-speed', 'gravity', 'retro-pong'
            ];

            // Remove ascii-tux in NSFW mode
            if (currentSource === 'nsfw') {
                effects = effects.filter(e => e !== 'ascii-tux');
            }

            const randomEffect = effects[Math.floor(Math.random() * effects.length)];

            // Chain: Element Eater (Intro) -> Random Effect
            triggerElementEater(() => {
                triggerConfetti(randomEffect);
            });

            eggClickCount = -999;
            return;
        }

        // Reset timer (if no click for 3000ms, revert to green)
        eggTimer = setTimeout(resetEgg, 3000);
    }
}

export function triggerElementEater(callback) {
    const footer = document.querySelector('footer');
    const wrapper = document.getElementById('status-dot-wrapper');
    const pingDot = document.getElementById('status-dot-ping');

    if (!footer || !wrapper) {
        if (callback) callback();
        return;
    }

    // 1. Prepare for EATING
    // Stop ping animation to keep it solid red
    if (pingDot) pingDot.classList.remove('animate-ping');

    // 2. FOOTER TURNS RED & FADES (EATING EFFECT)
    // Instead of dot expanding, the infection spreads to the footer container
    setTimeout(() => {
        footer.style.transition = 'all 1s ease-in-out';

        const footerBg = footer.querySelector('div');
        if (footerBg) {
            footerBg.style.transition = 'all 1s ease-in-out';
            footerBg.style.backgroundColor = '#ef4444'; // Red-500
            footerBg.style.borderColor = '#b91c1c'; // Red-700
            footerBg.style.boxShadow = '0 0 30px rgba(239, 68, 68, 0.6)';

            // Text color change
            footerBg.querySelectorAll('*').forEach(el => {
                el.style.transition = 'color 0.5s ease';
                el.style.color = 'white';
            });
        }

        // Dot Feedback (Just a pulse, no expansion)
        wrapper.style.transition = 'transform 0.5s ease';
    }, 100);

    // 3. VANISH
    setTimeout(() => {
        footer.style.opacity = '0';
        footer.style.transform = 'translate(-50%, 20px) scale(0.9)'; // Drop down slightly

        // TRIGGER NEXT STAGE CALLBACK HERE
        if (callback) callback();

    }, 1200);

    // 4. RETURN (Delayed to happen after the random effect finishes usually, or just restore it)
    // We restore the footer after 5s regardless, acting as the "cleanup" crew
    setTimeout(() => {
        // Reset styles
        wrapper.style.transform = 'scale(1)';

        if (pingDot) pingDot.classList.add('animate-ping');

        footer.style.transform = ''; // Reset transform

        requestAnimationFrame(() => {
            footer.style.opacity = '1';
            const footerBg = footer.querySelector('div');
            if (footerBg) {
                footerBg.style.backgroundColor = '';
                footerBg.style.borderColor = '';
                footerBg.style.boxShadow = '';
                footerBg.querySelectorAll('*').forEach(el => el.style.color = '');
            }
            resetEgg();
        });
    }, 6000); // Slightly longer delay to allow the random effect to shine
}

export function resetEgg() {
    eggClickCount = 0;
    const pingDot = document.getElementById('status-dot-ping');
    const coreDot = document.getElementById('status-dot-core');
    const wrapper = document.getElementById('status-dot-wrapper');

    if (pingDot && coreDot && wrapper) {
        // Restore styles (Green + Hover Yellow)
        pingDot.classList.remove('bg-red-500');
        pingDot.classList.add('bg-green-400', 'group-hover:bg-yellow-400');
        pingDot.style.animationDuration = '';

        coreDot.classList.remove('bg-red-600');
        coreDot.classList.add('bg-green-500', 'group-hover:bg-yellow-500');

        wrapper.style.transform = '';
        wrapper.style.animation = '';
        wrapper.classList.remove('opacity-0', 'scale-0');
    }
}

export function triggerConfetti(forcedEffect = null, config = {}) {
    const { isMobile } = window;

    // Default Config Merger
    const cfg = {
        duration: 5000,
        autoDismiss: true,
        gravity: 1.0,
        speed: 1.0,
        scale: 1.0,
        ...config
    };

    // Randomize effects
    const effects = [
        'emoji-rain', 'matrix-rain', 'spin-madness',
        'ascii-tux', 'retro-terminal', 'warp-speed',
        'screen-melt', 'retro-pong', 'element-eater'
    ];

    // Pick effect: forced > random
    const effect = forcedEffect || effects[Math.floor(Math.random() * effects.length)];

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '9999';
    container.style.overflow = 'hidden';
    container.style.opacity = '0'; // Start hidden
    container.style.transition = 'opacity 0.5s ease-in-out'; // Smooth fade
    document.body.appendChild(container);

    // Trigger Fade In
    requestAnimationFrame(() => {
        container.style.opacity = '1';
    });

    // Helper for clean fade out
    const fadeOutAndRemove = (delay) => {
        // Respect AutoDismiss setting (if false, never auto remove, unless delay is 0 which implies forced close)
        if (delay > 0 && !cfg.autoDismiss) return;

        setTimeout(() => {
            container.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(container)) document.body.removeChild(container);
                // Reset body overflow
                document.body.style.overflow = '';
                document.body.style.touchAction = '';
            }, 500); // Match transition duration
        }, delay);
    };

    // Close Button (Only for long/interactive effects)
    const interactiveEffects = ['retro-pong', 'screen-melt']; // Waifu handles its own
    if (interactiveEffects.includes(effect)) {
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = getIcon('close', 'w-6 h-6');
        closeBtn.className = 'fixed top-4 right-4 z-[10000] p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-opacity duration-500 opacity-0 pointer-events-none'; // Start hidden and non-clickable
        closeBtn.onclick = (e) => {
            e.stopPropagation(); // Prevent effect interaction
            fadeOutAndRemove(0);
        };
        container.appendChild(closeBtn);

        // Show after 2 seconds
        setTimeout(() => {
            closeBtn.classList.remove('opacity-0', 'pointer-events-none');
        }, 2000);
    }

    if (effect === 'emoji-rain') {
        // Expanded Emoji List (No R18)
        const baseEmojis = [
            '💥', '📱', '🎉', '🍎', '💻', '🚀', '💊', '👻', '🧱', '🔥', '✨',
            '💿', '💾', '🕹️', '👾', '🤖', '👽', '🦄', '🌈', '🍕', '🍔', '🍺',
            '💡', '📷', '🔋', '🔌', '📡', '🔭', '🎁', '🎈', '🎊', '🏆'
        ];

        // Twemoji (Twitter/Discord style) Base URL
        const twemojiBase = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/';

        // Helper to get hex code for Twemoji
        const getHex = (char) => char.codePointAt(0).toString(16);

        for (let i = 0; i < 60; i++) {
            const el = document.createElement('div');
            const char = baseEmojis[Math.floor(Math.random() * baseEmojis.length)];

            // Randomly choose style: Native (Text) vs Twemoji (Image)
            // 30% chance for Twemoji (Discord style)
            if (Math.random() < 0.3) {
                const img = document.createElement('img');
                img.src = `${twemojiBase}${getHex(char)}.svg`;
                img.style.width = '100%';
                img.style.height = '100%';
                el.appendChild(img);
            } else {
                el.innerText = char;
                // Randomize Native Font Stack to try and get Apple vs Google look (if installed)
                const fonts = [
                    '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif', // Default/System
                    '"Noto Color Emoji", sans-serif', // Force Noto if available
                    '"Segoe UI Emoji", sans-serif'    // Force Windows if available
                ];
                el.style.fontFamily = fonts[Math.floor(Math.random() * fonts.length)];
            }

            el.style.position = 'absolute';
            el.style.left = Math.random() * 100 + 'vw';
            el.style.top = '-50px';
            const size = (Math.random() * 20 + 20) * cfg.scale; // Scale Config
            el.style.fontSize = size + 'px';
            el.style.width = size + 'px'; // For image sizing
            el.style.height = size + 'px';

            // Adjust Fall Duration based on Gravity (Higher gravity = Faster/Lower duration)
            const duration = (Math.random() * 2 + 1) / cfg.gravity;

            el.style.animation = `fall-down ${duration}s linear forwards`;
            el.style.animationDelay = Math.random() * 0.5 + 's';
            container.appendChild(el);
        }

        // Auto-dismiss for emoji rain
        fadeOutAndRemove(cfg.duration);
    } else if (effect === 'matrix-rain') {
        container.style.pointerEvents = 'auto';
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        container.style.background = 'black';
        container.style.opacity = '0.9';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const chars = "01日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ12345789:・.=\"*+-<>¦｜";

        let columns = Math.ceil(canvas.width / 20); // ceil ensures coverage
        let drops = Array(columns).fill(1);

        // Resize Handler
        const onResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Recalculate columns
            const newColumns = Math.ceil(canvas.width / 20); // ceil ensures coverage
            // Preserve existing drops, extend or truncate
            if (newColumns > columns) {
                const added = new Array(newColumns - columns).fill(1);
                drops = drops.concat(added);
            } else if (newColumns < columns) {
                drops = drops.slice(0, newColumns);
            }
            columns = newColumns;
        };
        window.addEventListener('resize', onResize);

        function drawMatrix() {
            // Auto-detect resize
            if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
                onResize();
            }

            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#0F0';
            ctx.font = '15px monospace';
            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * 20, drops[i] * 20);
                if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }
        const interval = setInterval(drawMatrix, 50 / cfg.speed); // Speed Config

        // Cleanup only if Auto Dismiss is enabled
        if (cfg.autoDismiss) {
            setTimeout(() => {
                clearInterval(interval);
                window.removeEventListener('resize', onResize);
                fadeOutAndRemove(0);
            }, cfg.duration);
        } else {
            // If manual close (e.g. via console or external), we need to ensure listeners are cleaned
            // But since this effect doesn't have a close button, it runs forever until reload if autoDismiss is false
            // unless we provide a way to close it.
            // The container has pointer-events: auto, so we can click to close? No, it just eats clicks.
            // Let's add a click-to-close if autoDismiss is false, or just let it run.
            // User asked for "disable auto dismiss", implying infinite run.
        }
    } else if (effect === 'spin-madness') {
        document.body.style.transition = 'transform 1s ease-in-out';
        document.body.style.transform = 'rotate(360deg)';
        setTimeout(() => { document.body.style.transform = ''; }, 1000);
        const colors = ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f'];
        for (let i = 0; i < 50; i++) {
            const el = document.createElement('div');
            el.style.position = 'absolute';
            el.style.width = '10px';
            el.style.height = '10px';
            el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            el.style.left = '50%';
            el.style.top = '50%';
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 500 + 200;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;
            el.style.transition = `all ${1 / cfg.speed}s ease-out`; // Speed config
            container.appendChild(el);
            requestAnimationFrame(() => {
                el.style.transform = `translate(${tx}px, ${ty}px) rotate(${Math.random() * 720}deg)`;
                el.style.opacity = '0';
            });
        }
        fadeOutAndRemove(Math.min(cfg.duration, 4000)); // Spin madness is short
    } else if (effect === 'ascii-waifu') {
        container.style.pointerEvents = 'auto';
        container.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.zIndex = '10000'; // High z-index for input

        // 1. Terminal Input Interface
        const terminal = document.createElement('div');
        terminal.className = 'w-full max-w-2xl bg-black border border-green-500 font-mono text-green-500 p-6 rounded shadow-[0_0_30px_rgba(34,197,94,0.3)] flex flex-col gap-4 m-4 animate-scale-up';
        terminal.innerHTML = `
            <div class="border-b border-green-500/50 pb-2 mb-2 flex justify-between items-center">
                <span class="font-bold text-lg">> ART_COMPILER_V1.0</span>
                <span class="animate-pulse">_</span>
            </div>
            
            <div class="flex flex-col gap-2">
                <label class="text-xs font-bold opacity-70">>> INPUT_ASCII_SEQUENCE</label>
                <textarea id="waifu-art" rows="10" class="w-full bg-black/50 border border-green-500/30 text-xs p-2 focus:border-green-500 outline-none text-green-400 custom-scrollbar" placeholder="Paste ASCII Art Here..."></textarea>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                    <label class="text-xs font-bold opacity-70">>> ASPECT_RATIO (W:H)</label>
                    <input type="text" id="waifu-ratio" value="1:1" class="w-full bg-black/50 border border-green-500/30 text-xs p-2 focus:border-green-500 outline-none text-green-400" placeholder="e.g. 3:4">
                </div>
                <div class="flex flex-col gap-2">
                    <label class="text-xs font-bold opacity-70">>> COLOR_HEX</label>
                    <input type="text" id="waifu-color" value="#ff69b4" class="w-full bg-black/50 border border-green-500/30 text-xs p-2 focus:border-green-500 outline-none text-green-400" placeholder="#RRGGBB">
                </div>
            </div>

            <div class="pt-4 flex gap-3">
                <button id="waifu-submit" class="flex-1 py-2 bg-green-500/20 hover:bg-green-500/40 border border-green-500 text-green-400 font-bold uppercase tracking-wider transition-all">
                    > COMPILE & RENDER
                </button>
                <button id="waifu-cancel" class="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500 text-red-400 font-bold uppercase tracking-wider transition-all">
                    ABORT
                </button>
            </div>
        `;
        container.appendChild(terminal);

        const cleanUpInput = () => {
            terminal.remove();
        };

        // Cancel Handler
        terminal.querySelector('#waifu-cancel').onclick = () => {
            fadeOutAndRemove(0);
        };

        // Submit Handler
        terminal.querySelector('#waifu-submit').onclick = (e) => {
            e.stopPropagation();
            const art = terminal.querySelector('#waifu-art').value;
            const ratio = terminal.querySelector('#waifu-ratio').value;
            const color = terminal.querySelector('#waifu-color').value;

            if (!art.trim()) {
                alert("ERROR: NULL_INPUT_DETECTED");
                return;
            }

            cleanUpInput();
            renderWaifu(art, ratio, color);
        };

        // Prevent clicks inside terminal from bubbling (just in case we add container click later or for safety)
        terminal.onclick = (e) => {
            e.stopPropagation();
        };

        // 2. Rendering Logic (Moved into a closure function)
        const renderWaifu = (artStr, ratioStr, colorStr) => {
            container.style.backgroundColor = '#000000'; // Ensure dark bg

            const pre = document.createElement('pre');
            pre.style.position = 'absolute';
            pre.style.top = '50%';
            pre.style.left = '50%';
            pre.style.transformOrigin = 'center center';
            pre.style.fontSize = (10 * cfg.scale) + 'px';
            pre.style.lineHeight = (10 * cfg.scale) + 'px';
            pre.style.fontFamily = 'monospace';
            pre.style.transition = 'opacity 1s ease-out';
            pre.style.opacity = '0';
            pre.style.userSelect = 'none';
            pre.style.color = colorStr;
            pre.innerText = artStr;

            container.appendChild(pre);

            // Auto-scale Logic
            const scaleArt = () => {
                const lines = artStr.split('\n');
                const artHeight = lines.length;
                const artWidth = lines.reduce((max, line) => Math.max(max, line.length), 0);

                const screenW = window.innerWidth * 0.9;
                const screenH = window.innerHeight * 0.9;

                const charW = 6;
                const charH = 10;

                let scaleYCorrection = 1;
                if (ratioStr) {
                    const parts = ratioStr.split(':');
                    if (parts.length === 2) {
                        const rW = parseFloat(parts[0]);
                        const rH = parseFloat(parts[1]);
                        if (rW && rH) {
                            const targetRatio = rW / rH;
                            // Current visual ratio (width / height)
                            const currentRatio = (artWidth * charW) / (artHeight * charH);
                            // scaleYCorrection = currentRatio / targetRatio
                            scaleYCorrection = currentRatio / targetRatio;
                        }
                    }
                }

                const scaleX = screenW / (artWidth * charW);
                const scaleY = screenH / (artHeight * charH * scaleYCorrection);
                const scale = Math.min(scaleX, scaleY); // Fit contain

                pre.style.transform = `translate(-50%, -50%) scale(${scale}, ${scale * scaleYCorrection})`;
            };

            requestAnimationFrame(() => {
                scaleArt();
                pre.style.opacity = '1';
            });

            window.addEventListener('resize', scaleArt);

            const cleanup = () => {
                window.removeEventListener('resize', scaleArt);
                fadeOutAndRemove(0);
            };

            // Auto-dismiss for waifu
            if (cfg.autoDismiss) {
                setTimeout(cleanup, cfg.duration);
            }

            // Close controls
            container.onclick = cleanup;

            // Close Button
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = getIcon('close', 'w-8 h-8');
            closeBtn.className = 'fixed top-8 right-8 z-[10001] p-3 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all duration-500 opacity-0 pointer-events-none';
            // if (typeof isMobile === 'function' && isMobile()) closeBtn.style.display = 'none'; // REMOVED: Always show button now

            // Show after 2 seconds
            setTimeout(() => {
                closeBtn.classList.remove('opacity-0', 'pointer-events-none');
            }, 2000);

            const btnContainer = document.createElement('div');
            btnContainer.className = 'absolute inset-0 pointer-events-none group';
            btnContainer.appendChild(closeBtn);
            container.appendChild(btnContainer);

            closeBtn.style.pointerEvents = 'auto';
            closeBtn.onclick = (e) => {
                e.stopPropagation();
                cleanup();
            };
        };

    } else if (effect === 'ascii-tux') {
        const pre = document.createElement('pre');
        pre.style.position = 'absolute';
        pre.style.top = '50%';
        pre.style.left = '50%';
        pre.style.transform = 'translate(-50%, -50%) scale(0.1)';
        pre.style.fontSize = '12px';
        pre.style.lineHeight = '12px';
        pre.style.color = '#000';
        pre.style.fontFamily = 'monospace';
        pre.style.transition = 'all 0.5s ease-out';
        pre.style.opacity = '0';
        if (document.documentElement.classList.contains('dark')) pre.style.color = '#fff';

        // Responsive Scale Logic
        let baseScale = 1.5;
        const updateScale = () => {
            const minDim = Math.min(window.innerWidth, window.innerHeight);
            // Base scale 1.5 for 400px screen.
            baseScale = Math.max(1.5, (minDim / 400) * 1.5) * cfg.scale; // Scale Config
        };
        window.addEventListener('resize', updateScale);
        updateScale();

        const arts = {
            tux: {
                frames: [`
         _nnnn_
        dGGGGMMb
       @p~qp~~qMb
       M|@||@) M|
       @,----.JM|
      JS^\\__/  qKL
     dZP        qKRb
    dZP          qKKb
   fZP            SMMb
   HZM            MMMM
   FqM            MMMM
 __| ".        |\\dS"qML
 |    \`.       | \`' \\Zq
_)      \\.___.,|     .'
\\____   )MMMMMP|   .'
     \`-'       \`--' 
`],
                animator: (elapsed, baseArt) => {
                    const closedEyes = baseArt.replace('M|@||@)', 'M|-||-)');
                    return (elapsed % 3000 < 150) ? closedEyes : baseArt;
                }
            },
            dragon: {
                frames: [`
                \\||/
                |  @___oo
      /\\  /\\   / (__,,,,|
     ) /^\\) ^\\/ _)
     )   /^\\/   _)
     )   _ /  / _)
 /\\  )/\\/ ||  | )_)
<  >      |(,,) )__)
 ||      /    \\)___)\\
 | \\____(      )___) )___
  \\______(_______;;; __;;;
`],
                animator: (elapsed, baseArt) => {
                    if (elapsed % 2000 < 1000) {
                        return baseArt.replace('o', 'O').replace('o', 'O'); // Eyes open wider
                    }
                    // Fire breath
                    return baseArt.replace('oo', 'oo  🔥🔥🔥');
                }
            },
            amogus: {
                frames: [`
      . 　　　。　　　　•　 　ﾟ　　。 　　.

　　　.　　　 　　.　　　　　。　　 。　. 　

.　　 。　　　　　 ඞ 。 . 　　 • 　　　　•

　　ﾟ　　 Blue was An Impostor.　 。　.

　　'　　　 1 Impostor remains 　 　　。

　　ﾟ　　　.　　　. ,　　　　.　 .
`],
                animator: (elapsed, baseArt) => baseArt
            },
            rick: {
                frames: [`
      .---.
     / o o \\
    (   ^   )
     \\  -  /
      |||||
     /|___|\\
    / |   | \\
      |   |
     /     \\
    |       |
`],
                animator: (elapsed, baseArt) => {
                    const lyrics = [
                        "Never gonna give you up",
                        "Never gonna let you down",
                        "Never gonna run around",
                        "and desert you"
                    ];
                    const index = Math.floor(elapsed / 1500) % lyrics.length;

                    // Dancing
                    let art = baseArt;
                    if (Math.floor(elapsed / 250) % 2 === 0) {
                        art = art.replace('/|___|\\', '\\|___|/').replace('(   ^   )', '(   >   )');
                    } else {
                        art = art.replace('(   ^   )', '(   <   )');
                    }

                    return art + "\n\n" + lyrics[index];
                }
            }
        };

        let selectedKey;
        if (effect === 'ascii-waifu') {
            selectedKey = 'waifu';
        } else {
            // Filter out waifu from normal random pool
            const artKeys = Object.keys(arts).filter(k => k !== 'waifu');
            selectedKey = artKeys[Math.floor(Math.random() * artKeys.length)];
        }

        const selectedArt = arts[selectedKey];
        const baseFrame = selectedArt.frames[0];

        pre.innerText = baseFrame;
        container.appendChild(pre);

        requestAnimationFrame(() => {
            // Tux body is slightly left-heavy in ASCII, shift right to visually center
            const xOffset = '15px';
            pre.style.transform = `translate(calc(-50% + ${xOffset}), -50%) scale(${baseScale})`;
            pre.style.opacity = '1';

            const onMouseMove = (e) => {
                let clientX, clientY;
                if (e.touches && e.touches.length > 0) {
                    clientX = e.touches[0].clientX;
                    clientY = e.touches[0].clientY;
                } else {
                    clientX = e.clientX;
                    clientY = e.clientY;
                }

                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                const dx = clientX - centerX;
                const dy = clientY - centerY;
                const rotation = Math.max(-30, Math.min(30, dx / 20));
                const lean = Math.max(-0.2, Math.min(0.2, dy / 500));
                pre.style.transform = `translate(calc(-50% + ${xOffset}), -50%) scale(${baseScale + lean}) rotate(${rotation}deg)`;
            };
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('touchmove', onMouseMove, { passive: false });

            let startTime = Date.now();
            const waddle = setInterval(() => {
                const elapsed = Date.now() - startTime;
                if (selectedArt.animator) {
                    pre.innerText = selectedArt.animator(elapsed * cfg.speed, baseFrame); // Speed Config
                }
            }, 50);

            if (cfg.autoDismiss) {
                setTimeout(() => {
                    clearInterval(waddle);
                    window.removeEventListener('resize', updateScale);
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('touchmove', onMouseMove);
                    pre.style.transition = 'all 0.5s ease-in';
                    pre.style.transform = 'translate(-50%, -50%) scale(0) rotate(720deg)';
                    pre.style.opacity = '0';
                    fadeOutAndRemove(500); // Wait for transition
                }, cfg.duration);
            }
        });
        // Remove the outer fadeOutAndRemove since we handle it inside
        // fadeOutAndRemove(cfg.duration + 500); 
    } else if (effect === 'retro-terminal') {
        container.style.background = '#000';
        container.style.color = '#0f0';
        container.style.fontFamily = 'monospace';
        container.style.padding = '20px';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.style.fontSize = (24 * cfg.scale) + 'px'; // Scale Config
        container.innerText = '> SYSTEM COMPROMISED...\n> REBOOTING KERNEL...\n> LOADING...';

        setTimeout(() => container.innerText += '\n> ACCESS GRANTED.', 1000 / cfg.speed);
        setTimeout(() => container.innerText += '\n> JUST KIDDING :P', 2000 / cfg.speed);
        fadeOutAndRemove(cfg.duration);
    } else if (effect === 'warp-speed') {
        container.style.pointerEvents = 'auto'; // Block interaction & Allow Long Press
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        container.style.background = 'black';
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        let cx = canvas.width / 2;
        let cy = canvas.height / 2;

        // Resize Handler
        const onResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            cx = canvas.width / 2;
            cy = canvas.height / 2;
        };
        window.addEventListener('resize', onResize);

        class Star {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = (Math.random() - 0.5) * canvas.width * 2;
                this.y = (Math.random() - 0.5) * canvas.height * 2;
                this.z = Math.random() * 2000 + 500;
                this.pz = this.z;
                this.color = `hsl(${Math.random() * 60 + 200}, 100%, 80%)`;
            }
            update(speed) {
                this.z -= speed;
                if (this.z < 1) {
                    this.reset();
                    this.z = 2000;
                    this.pz = this.z;
                }
            }
            draw() {
                const x = cx + (this.x / this.z) * 1000;
                const y = cy + (this.y / this.z) * 1000;
                const px = cx + (this.x / this.pz) * 1000;
                const py = cy + (this.y / this.pz) * 1000;
                this.pz = this.z;
                if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) return;
                const size = (1 - this.z / 2000) * 4;
                const alpha = (1 - this.z / 2000);
                ctx.beginPath();
                ctx.strokeStyle = this.color;
                ctx.lineWidth = size;
                ctx.globalAlpha = alpha;
                ctx.moveTo(px, py);
                ctx.lineTo(x, y);
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        }

        const stars = [];
        for (let i = 0; i < 800; i++) stars.push(new Star());

        let speed = 2;
        let targetSpeed = 2;
        let isAccelerating = false;
        let isStopping = false;
        let stopTimer = null;
        let frame = 0;

        // Acceleration Handlers
        const startAccel = (e) => {
            e.preventDefault();
            // If we were stopping, cancel the stop sequence
            if (isStopping) {
                isStopping = false;
                if (stopTimer) {
                    clearTimeout(stopTimer);
                    stopTimer = null;
                }
            }
            isAccelerating = true;
            targetSpeed = 50;
        };
        const stopAccel = (e) => {
            e.preventDefault();
            isAccelerating = false;
            targetSpeed = 2; // Return to cruising speed

            // Start a timer to eventually stop and exit if no more interaction
            if (stopTimer) clearTimeout(stopTimer);
            stopTimer = setTimeout(() => {
                isStopping = true;
                targetSpeed = 0;
            }, 2000); // Wait 2 seconds before starting full stop
        };

        container.addEventListener('mousedown', startAccel);
        container.addEventListener('touchstart', startAccel, { passive: false });

        container.addEventListener('mouseup', stopAccel);
        container.addEventListener('touchend', stopAccel);
        container.addEventListener('mouseleave', stopAccel);

        function animate() {
            // Auto-detect resize (Robustness for mobile zoom)
            if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
                onResize();
            }

            // Clear trail
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Speed Physics
            // Smoothly interpolate speed towards targetSpeed
            speed += (targetSpeed - speed) * 0.05;

            // If fully stopped, exit
            if (isStopping && speed < 0.1) {
                window.removeEventListener('resize', onResize);
                fadeOutAndRemove(0);
                return; // Stop loop
            }

            stars.forEach(star => {
                star.update(speed * cfg.speed); // Apply Speed Config
                star.draw();
            });
            frame++;
            if (document.body.contains(container)) requestAnimationFrame(animate);
        }
        animate();

        // Hint Text
        const hint = document.createElement('div');
        hint.className = "absolute bottom-10 left-0 right-0 text-center text-cyan-400 font-mono text-sm opacity-50 animate-pulse pointer-events-none select-none";
        hint.innerText = "HOLD TO WARP // RELEASE TO EXIT";
        container.appendChild(hint);

        // Auto remove for Warp Speed if autoDismiss is true (otherwise it waits for user interaction)
        if (cfg.autoDismiss && cfg.duration > 0) {
            setTimeout(() => {
                isStopping = true;
                targetSpeed = 0;
            }, cfg.duration);
        }

        return;
        return;
    } else if (effect === 'fireworks') {
        container.style.pointerEvents = 'auto'; // allow clicking for manual fireworks
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        // Particle System
        const particles = [];
        const rockets = [];

        class Particle {
            constructor(x, y, color) {
                this.x = x;
                this.y = y;
                // Explosion velocity
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 4 + 1;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
                this.color = color;
                this.alpha = 1;
                this.decay = Math.random() * 0.02 + 0.01;
                this.gravity = 0.05;
            }
            update() {
                this.vx *= 0.95; // Friction
                this.vy *= 0.95;
                this.vy += this.gravity;
                this.x += this.vx;
                this.y += this.vy;
                this.alpha -= this.decay;
            }
            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        class Rocket {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.vx = (Math.random() - 0.5) * 4;
                this.vy = -(Math.random() * 5 + 10); // Launch speed
                this.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
                this.targetY = Math.random() * (window.innerHeight * 0.5); // Explode below top
                this.exploded = false;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.vy += 0.1; // Gravity while rising

                // Trail
                if (Math.random() < 0.3) {
                    particles.push(new Particle(this.x, this.y, '#fff'));
                }

                if (this.vy >= 0 || this.y <= this.targetY) {
                    this.explode();
                }
            }
            explode() {
                this.exploded = true;
                // Burst
                for (let i = 0; i < 50; i++) {
                    particles.push(new Particle(this.x, this.y, this.color));
                }
            }
            draw() {
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, 3, 3);
            }
        }

        // Auto Fire Loop
        let frame = 0;
        const animateFireworks = () => {
            if (!document.body.contains(container)) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height); // Semi-clear is also cool for trails, but full clear is cleaner

            // Randomly launch rockets
            if (frame % 30 === 0 && Math.random() < 0.5) {
                rockets.push(new Rocket(Math.random() * canvas.width, canvas.height));
            }
            frame++;

            // Update Rockets
            for (let i = rockets.length - 1; i >= 0; i--) {
                const r = rockets[i];
                r.update();
                r.draw();
                if (r.exploded) rockets.splice(i, 1);
            }

            // Update Particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.update();
                p.draw();
                if (p.alpha <= 0) particles.splice(i, 1);
            }

            requestAnimationFrame(animateFireworks);
        };

        animateFireworks();

        // Click to launch
        container.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            // Instant explosion or rocket? Let's do instant explosion at click for fun
            for (let i = 0; i < 50; i++) {
                particles.push(new Particle(x, y, `hsl(${Math.random() * 360}, 70%, 50%)`));
            }
        });

        // Close after delay if autoDismiss
        if (cfg.autoDismiss && cfg.duration > 0) {
            setTimeout(() => {
                fadeOutAndRemove(1000);
            }, cfg.duration + 3000); // Give it some time
        }

        return;
    } else if (effect === 'retro-pong') {
        container.style.background = 'rgba(0,0,0,0.85)';
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';

        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Resize Handler
        const onResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Ensure paddles stay within bounds
            if (typeof playerY !== 'undefined') playerY = Math.min(playerY, canvas.height - 120);
            if (typeof aiY !== 'undefined') aiY = Math.min(aiY, canvas.height - 120);
            // Ensure ball stays within bounds
            if (typeof ball !== 'undefined') {
                if (ball.y > canvas.height) ball.y = canvas.height - ball.r;
                if (ball.x > canvas.width) ball.x = canvas.width - ball.r;
            }
        };
        window.addEventListener('resize', onResize);

        container.style.pointerEvents = 'auto';
        container.style.cursor = 'none';
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        let ball = { x: canvas.width / 2, y: canvas.height / 2, dx: 0, dy: 0, r: 15, speed: 0 };
        let playerY = canvas.height / 2 - 60;
        let targetPlayerY = playerY; // For smooth interpolation
        let aiY = canvas.height / 2 - 60;
        let playerScore = 0;
        let aiScore = 0;
        let isPlayerActive = false;
        let lastInteractionTime = Date.now();
        let gameOver = false;
        let autoCloseTimer = null;

        // Game State: 'serve', 'playing', 'scored', 'gameover'
        let gameState = 'serve';
        let serveTimer = 0;
        let serveDelay = 60; // Frames (approx 1 sec)
        let server = 'player'; // Who serves next

        // Use relative movement for touch to prevent jumping
        let lastTouchY = null;

        const onMouseMove = (e) => {
            isPlayerActive = true;
            lastInteractionTime = Date.now();

            // Cancel any pending auto-close
            if (autoCloseTimer) {
                clearTimeout(autoCloseTimer);
                autoCloseTimer = null;
            }

            let targetYRaw = 0;
            let isTouch = false;

            // Handle Touch
            if (e.touches && e.touches.length > 0) {
                isTouch = true;
                const touch = e.touches[0];
                const currentTouchY = touch.clientY;

                // Allow exiting by touching top corners
                if (currentTouchY < 80 && (touch.clientX < 80 || touch.clientX > window.innerWidth - 80)) {
                    return;
                }

                e.preventDefault();

                // Relative Movement Logic
                if (lastTouchY !== null) {
                    const deltaY = currentTouchY - lastTouchY;
                    targetPlayerY = playerY + deltaY;
                } else {
                    targetPlayerY = playerY;
                }

                lastTouchY = currentTouchY;

            } else {
                // Handle Mouse
                targetYRaw = e.clientY - 60;
                targetPlayerY = Math.max(0, Math.min(canvas.height - 120, targetYRaw));
            }

            // Clamp target
            targetPlayerY = Math.max(0, Math.min(canvas.height - 120, targetPlayerY));

            // Instant snap for touch (Absolute Mapping)
            if (isTouch) {
                // If touch, we want absolute mapping to finger position
                // Center the paddle on the finger
                // Finger Y = Pad Center
                // Pad Top = Finger Y - 60
                let absTouchY = e.touches[0].clientY - 60;
                absTouchY = Math.max(0, Math.min(canvas.height - 120, absTouchY));

                targetPlayerY = absTouchY;
                playerY = targetPlayerY; // Instant snap
            }
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('touchmove', onMouseMove, { passive: false });

        // REMOVED: Double tap exit (replaced by close button)
        // document.addEventListener('touchend', onTouchEnd);

        // Also reset on touchstart to be safe
        const onTouchStart = (e) => {
            // Prevent default to stop scrolling
            if (e.target === canvas) e.preventDefault();
        };
        document.addEventListener('touchstart', onTouchStart, { passive: false });

        function resetBall(winner) {
            gameState = 'serve';
            serveTimer = 60; // 1 second delay
            server = winner === 'ai' ? 'player' : 'ai'; // Loser serves? Or winner? Standard is winner serves or alternate. Let's do alternate or winner. Winner serves is standard.

            // Reset position
            ball.x = canvas.width / 2;
            ball.y = canvas.height / 2;
            ball.dx = 0;
            ball.dy = 0;

            // Calculate base speed for next serve
            // Slower start speed: 0.3% of width
            // Min 3px, Max 8px
            const baseSpeed = Math.max(3, Math.min(8, canvas.width * 0.003)) * cfg.speed;
            ball.speed = baseSpeed;

            // Reset interaction time
            lastInteractionTime = Date.now();
        }

        // Initial launch
        resetBall('player');

        function launchBall() {
            gameState = 'playing';
            // Direction based on server
            let dirX = server === 'player' ? 1 : -1;

            // Randomize Y angle slightly, but keep X component strong
            // Angle between -45 and 45 degrees
            const angle = (Math.random() * Math.PI / 2) - (Math.PI / 4);

            ball.dx = dirX * ball.speed * Math.cos(angle);
            ball.dy = ball.speed * Math.sin(angle);
        }

        function updatePhysics() {
            if (gameOver) return;

            // Smooth Paddle Movement
            if (isPlayerActive) {
                playerY += (targetPlayerY - playerY) * 0.2;
                if (Math.abs(targetPlayerY - playerY) < 0.5) playerY = targetPlayerY;
            }

            // Game State Logic
            if (gameState === 'serve') {
                serveTimer--;
                if (serveTimer <= 0) {
                    launchBall();
                }

                // AI Tracking during serve (get ready)
                let aiTarget = canvas.height / 2 - 60;
                aiY += (aiTarget - aiY) * 0.05;
                return;
            }

            if (gameState === 'scored') {
                // Wait for ball to go fully off screen or delay
                // Actually, if we are in 'scored', we usually transition to 'serve' immediately or after short delay
                // Logic handled in ball bounds check
                return;
            }

            // Playing State
            ball.x += ball.dx;
            ball.y += ball.dy;

            // Ceiling / Floor Bounce
            if (ball.y - ball.r < 0) {
                ball.y = ball.r;
                ball.dy = Math.abs(ball.dy);
            }
            if (ball.y + ball.r > canvas.height) {
                ball.y = canvas.height - ball.r;
                ball.dy = -Math.abs(ball.dy);
            }

            // Paddle Collision (Player)
            // Check AABB first
            // Paddle: x=20, w=20, y=playerY, h=120
            // Ball: x=ball.x, r=ball.r
            if (ball.dx < 0) {
                if (ball.x - ball.r < 40 && ball.x + ball.r > 20 && ball.y + ball.r > playerY && ball.y - ball.r < playerY + 120) {
                    // Hit!
                    // Calculate deflection angle based on hit position relative to center
                    const hitPoint = ball.y - (playerY + 60);
                    // Normalize hit point: -60 to 60 -> -1 to 1
                    let normalizedHit = hitPoint / 60;

                    // Max angle: 45 degrees (PI/4)
                    const bounceAngle = normalizedHit * (Math.PI / 4);

                    // Increase speed on hit (Aggressive acceleration)
                    // Cap at ~3x initial speed or user config limit
                    const maxSpeed = Math.max(15, Math.min(30, canvas.width * 0.02)) * cfg.speed;
                    ball.speed = Math.min(ball.speed * 1.15, maxSpeed);

                    ball.dx = ball.speed * Math.cos(bounceAngle);
                    ball.dy = ball.speed * Math.sin(bounceAngle);

                    // Ensure it moves right
                    if (ball.dx < 0) ball.dx = -ball.dx;

                    // Push out of collision
                    ball.x = 40 + ball.r;
                }
            }

            // Paddle Collision (AI)
            // Paddle: x=width-40, w=20, y=aiY, h=120
            if (ball.dx > 0) {
                if (ball.x + ball.r > canvas.width - 40 && ball.x - ball.r < canvas.width - 20 && ball.y + ball.r > aiY && ball.y - ball.r < aiY + 120) {
                    const hitPoint = ball.y - (aiY + 60);
                    let normalizedHit = hitPoint / 60;
                    const bounceAngle = normalizedHit * (Math.PI / 4);

                    const maxSpeed = Math.max(15, Math.min(30, canvas.width * 0.02)) * cfg.speed;
                    ball.speed = Math.min(ball.speed * 1.15, maxSpeed);

                    ball.dx = -ball.speed * Math.cos(bounceAngle);
                    ball.dy = ball.speed * Math.sin(bounceAngle);

                    // Ensure it moves left
                    if (ball.dx > 0) ball.dx = -ball.dx;

                    ball.x = canvas.width - 40 - ball.r;
                }
            }

            // Scoring
            // Allow ball to go fully off screen before resetting
            if (ball.x < -ball.r * 2) {
                aiScore++;
                gameState = 'scored';
                resetBall('ai'); // AI scored, AI serves (or player serves? Winner serves usually)
            } else if (ball.x > canvas.width + ball.r * 2) {
                playerScore++;
                gameState = 'scored';
                resetBall('player');
            }

            // AI Logic
            let targetY = ball.y - 60;
            // Introduce error/reaction delay for AI based on difficulty/speed
            // Basic lerp
            aiY += (targetY - aiY) * 0.08;
            aiY = Math.max(0, Math.min(canvas.height - 120, aiY));

            if (!isPlayerActive) {
                // Auto-play / Demo Mode
                let pTarget = ball.y - 60;
                targetPlayerY = Math.max(0, Math.min(canvas.height - 120, pTarget));
                playerY += (targetPlayerY - playerY) * 0.08;
            }
        }

        function draw() {
            // Check Auto Close logic
            if (cfg.autoDismiss && !gameOver) {
                // Determine if we should count this as idle
                // If game is in play, NEVER auto-close
                // We only auto-close if in 'gameover' or maybe 'serve' for too long?
                // User said: "disappearance logic... ensure it doesn't auto-close while playing"

                // So, let's DISABLE auto-close entirely while playing.
                // Relegate auto-close only to when game is over?
                // Or if user is AFK for extremely long time?

                // Let's just disable the idle timeout during gameplay.
                // The close button is there for manual exit.
            }

            // Auto-detect resize
            if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
                onResize();
            }

            updatePhysics();

            if (playerScore >= 3 || aiScore >= 3) {
                gameOver = true;
                gameState = 'gameover';
            }

            if (gameOver) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                let resultText = "";
                let color = "#fff";
                if (isPlayerActive) {
                    resultText = playerScore >= 3 ? "YOU WIN!" : "YOU LOSE!";
                    color = playerScore >= 3 ? "#0f0" : "#f00";
                } else {
                    resultText = "DEMO OVER";
                    color = "#aaa";
                }
                ctx.fillStyle = color;
                ctx.font = 'bold 80px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(resultText, canvas.width / 2, canvas.height / 2 - 20);
                ctx.fillStyle = "#fff";
                ctx.font = '30px monospace';
                ctx.fillText(`${playerScore} - ${aiScore}`, canvas.width / 2, canvas.height / 2 + 60);

                if (!window.pongEnding) {
                    window.pongEnding = true;
                    setTimeout(() => { fadeOutAndRemove(0); window.pongEnding = false; }, 3000);
                }
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#333';
            ctx.setLineDash([10, 15]);
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.stroke();

            ctx.fillStyle = '#444';
            ctx.font = '100px monospace';
            ctx.fillText(playerScore, canvas.width / 4, 100);
            ctx.fillText(aiScore, canvas.width * 3 / 4, 100);

            ctx.fillStyle = '#666';
            ctx.font = '20px monospace';
            ctx.textAlign = 'center';
            ctx.fillText("FIRST TO 3 WINS", canvas.width / 2, 50);

            // Draw "Get Ready" text if serving
            if (gameState === 'serve') {
                ctx.fillStyle = '#fff';
                ctx.font = '30px monospace';
                ctx.fillText(server === 'player' ? "PLAYER SERVE" : "AI SERVE", canvas.width / 2, canvas.height / 2 - 80);

                // Draw countdown dots
                const dots = Math.ceil(serveTimer / 20);
                let dotStr = ".".repeat(dots);
                ctx.font = '40px monospace';
                ctx.fillText(dotStr, canvas.width / 2, canvas.height / 2 + 60);
            }

            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
            ctx.fill();

            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#10b981';
            ctx.fillStyle = '#10b981';
            ctx.fillRect(20, playerY, 20, 120);
            ctx.shadowColor = '#f43f5e';
            ctx.fillStyle = '#f43f5e';
            ctx.fillRect(canvas.width - 40, aiY, 20, 120);
            ctx.restore();

            if (document.body.contains(container)) requestAnimationFrame(draw);
        }
        draw();

        // Removed fixed autoCloseTimer, relying on draw loop check

        const observer = new MutationObserver((mutations) => {
            if (!document.body.contains(container)) {
                window.removeEventListener('resize', onResize);
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('touchmove', onMouseMove);
                document.removeEventListener('touchmove', onMouseMove);
                document.removeEventListener('touchstart', onTouchStart);
                observer.disconnect();
                gameOver = true;
            }
        });
        observer.observe(document.body, { childList: true });
        return;
    }
}

