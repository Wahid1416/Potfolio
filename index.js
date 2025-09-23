// Utility: safe localStorage
function storageGet(key) {
    try { return localStorage.getItem(key); } catch { return null; }
}
function storageSet(key, value) {
    try { localStorage.setItem(key, value); } catch {}
}

// Theme handling
const THEME_KEY = 'pref-theme';
function applyTheme(theme) {
    if (!theme) return;
    document.documentElement.setAttribute('data-theme', theme);
}
function initTheme() {
    const saved = storageGet(THEME_KEY);
    if (saved) {
        applyTheme(saved);
        return saved;
    }
    // If no saved theme, initialize from system preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = prefersDark ? 'dark' : 'light';
    applyTheme(initial);
    return initial;
}

// Mobile nav toggle
function setupNavToggle() {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.getElementById('nav-menu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        menu.classList.toggle('open');
    });
    menu.addEventListener('click', (e) => {
        if (e.target.closest('a')) {
            menu.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// Smooth anchor scrolling (offset for sticky header)
function setupSmoothAnchors() {
    const header = document.querySelector('.site-header');
    const headerHeight = header ? header.offsetHeight : 0;
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const href = a.getAttribute('href');
            if (!href || href.length < 2) return;
            const target = document.getElementById(href.slice(1));
            if (!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - (headerHeight + 8);
            window.scrollTo({ top, behavior: 'smooth' });
            history.pushState(null, '', href);
        });
    });
}

// Footer year
function setYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = String(new Date().getFullYear());
}

// Codeforces API integration
async function fetchJSON(url) {
    const res = await fetch(url, { headers: { 'Accept': 'application/json' }, cache: 'no-store' });
    if (!res.ok) throw new Error('Network error');
    return await res.json();
}

function formatContest(contest, rank) {
    const name = contest.name || 'Contest';
    const when = contest.startTimeSeconds ? new Date(contest.startTimeSeconds * 1000).toLocaleDateString() : '';
    const rk = typeof rank === 'number' ? ` • Rank ${rank}` : '';
    return `${name} (${when})${rk}`;
}

async function loadCodeforcesStats() {
    const container = document.querySelector('.cf-stats');
    if (!container) return;
    const handle = container.getAttribute('data-cf-handle');
    if (!handle || handle === 'your_codeforces_handle') return;
    const ratingEl = document.getElementById('cf-rating-value');
    const latestEl = document.getElementById('cf-latest-value');
    try {
        const [{ result: users }, { result: standings }] = await Promise.all([
            fetchJSON(`https://codeforces.com/api/user.info?handles=${encodeURIComponent("mdisharaf")}`),
            fetchJSON(`https://codeforces.com/api/user.rating?handle=${encodeURIComponent("mdisharaf")}`)
        ]);
        if (users && users[0]) {
            const user = users[0];
            const ratingText = user.rating ? `${user.rating} (${user.rank})` : 'Unrated';
            if (ratingEl) ratingEl.textContent = ratingText;
        }
        if (standings && standings.length) {
            const last = standings[standings.length - 1];
            if (latestEl) latestEl.textContent = formatContest(last.contestName ? { name: last.contestName, startTimeSeconds: last.ratingUpdateTimeSeconds } : { name: 'Contest', startTimeSeconds: last.ratingUpdateTimeSeconds }, last.newRank);
        } else if (latestEl) {
            latestEl.textContent = 'No contests yet';
        }
    } catch (e) {
        if (ratingEl) ratingEl.textContent = '—';
        if (latestEl) latestEl.textContent = '—';
    }
}

// Theme toggle button
function setupThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    // Set initial aria-pressed state
    const current = document.documentElement.getAttribute('data-theme');
    btn.setAttribute('aria-pressed', current === 'dark' ? 'true' : 'false');
    btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        storageSet(THEME_KEY, next);
        btn.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
    });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupThemeToggle();
    setupNavToggle();
    setupSmoothAnchors();
    setYear();
    loadCodeforcesStats();
});


