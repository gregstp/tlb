const ROOT_URL = 'https://gregstp.github.io/tlb/';
const BOOKMARKLET = `
javascript: (function() {
    let token = null;

    try {
        const session = window.localStorage && window.localStorage.getItem("ADMIN_TRYCENTS:PRODUCTION:SESSION");

        if (session) {
            const parsed = JSON.parse(session).token;

            token = parsed;
        }
    } catch {
    }

    if (token) {
        window.open('${ROOT_URL}?authtoken=' + token, '_blank');
    }
})();
`;

addEventListener('load', () => {
    const root = document.getElementById('root');
    const loc = window.location;
    let token = 'N/A';

    if (loc && loc.search) {
        const tokenParam = (new URLSearchParams(loc.search)).get('authtoken');

        if (tokenParam) {
            token = tokenParam;
        }
    }

    root.innerHTML = `<h1>Token: ${token}</h1>`;

    const bm = document.createElement('a');

    bm.textContent = 'Launch TLB';
    bm.href = BOOKMARKLET;

    root.appendChild(bm);
});