// ── Case study authentication ─────────────────────────────
// Password is never stored in plain text — only its SHA-256
// hash is present in this file. Authentication state is kept
// in sessionStorage so the user only has to enter it once.

(function () {
  const HASH = '8372f56a6b3c1f7e9a0143ba485f3723089b01c722e0c6cd10f15b0abc61f695';
  const SESSION_KEY = 'cs_auth';

  // Pages that should be fully blocked until authenticated
  const GUARDED_PAGES = [
    'ai-powered-setup.html',
    'scalable-setup-guidance.html',
    'account-setup-optimization.html',
  ];

  async function sha256(str) {
    const buf = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(str)
    );
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Build the modal. label = text shown above the input.
  // onSuccess = callback to run after correct password is entered.
  function buildModal(label, buttonText, onSuccess) {
    const overlay = document.createElement('div');
    overlay.id = 'auth-overlay';
    overlay.innerHTML = `
      <div id="auth-box">
        <p id="auth-label">${label}</p>
        <form id="auth-form" autocomplete="off">
          <input
            id="auth-input"
            type="password"
            placeholder="Enter password"
            autocomplete="current-password"
            aria-label="Password"
          />
          <button type="submit">${buttonText}</button>
        </form>
        <p id="auth-error" aria-live="polite"></p>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      #auth-overlay {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(252, 243, 237, 0.96);
        backdrop-filter: blur(4px);
      }
      #auth-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 48px 40px;
        background: #FCF3ED;
        border: 1px solid rgba(28,28,26,0.12);
        max-width: 360px;
        width: 90%;
      }
      #auth-label {
        font-family: 'Libre Franklin', sans-serif;
        font-size: 14px;
        font-weight: 300;
        color: #1C1C1A;
        text-align: center;
        opacity: 0.7;
      }
      #auth-form {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
      }
      #auth-input {
        width: 100%;
        padding: 10px 14px;
        font-family: 'Libre Franklin', sans-serif;
        font-size: 14px;
        font-weight: 300;
        border: 1px solid rgba(28,28,26,0.3);
        background: transparent;
        color: #1C1C1A;
        outline: none;
      }
      #auth-input:focus {
        border-color: #1C1C1A;
      }
      #auth-form button {
        width: 100%;
        padding: 10px 14px;
        font-family: 'Libre Franklin', sans-serif;
        font-size: 14px;
        font-weight: 300;
        background: #1C1C1A;
        color: #FCF3ED;
        border: none;
        cursor: pointer;
        letter-spacing: 0.02em;
      }
      #auth-form button:hover {
        opacity: 0.85;
      }
      #auth-error {
        font-family: 'Libre Franklin', sans-serif;
        font-size: 13px;
        font-weight: 300;
        color: #1C1C1A;
        min-height: 18px;
        opacity: 0.7;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(overlay);

    document.getElementById('auth-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      const val = document.getElementById('auth-input').value;
      const hashed = await sha256(val);
      if (hashed === HASH) {
        sessionStorage.setItem(SESSION_KEY, '1');
        overlay.remove();
        style.remove();
        onSuccess();
      } else {
        document.getElementById('auth-error').textContent = 'Incorrect password.';
        document.getElementById('auth-input').value = '';
        document.getElementById('auth-input').focus();
      }
    });
  }

  function isAuthenticated() {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  }

  // Full-page guard for case study pages
  function guardPage() {
    if (isAuthenticated()) return;
    document.documentElement.style.overflow = 'hidden';
    buildModal('These case studies are password protected.', 'View case study', function () {
      document.documentElement.style.overflow = '';
    });
  }

  // Intercept a download link and require auth before allowing it
  function guardDownloadLink(link) {
    link.addEventListener('click', function (e) {
      if (isAuthenticated()) return; // already authed — let it through
      e.preventDefault();
      const href = link.getAttribute('href');
      const download = link.getAttribute('download');
      buildModal('Enter the password to download.', 'Download resumé', function () {
        // Trigger the download programmatically after auth
        const a = document.createElement('a');
        a.href = href;
        if (download !== null) a.download = download || '';
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
    });
  }

  function init() {
    const path = window.location.pathname;
    const isGuardedPage = GUARDED_PAGES.some(p => path.endsWith(p));

    if (isGuardedPage) {
      guardPage();
    }

    // Intercept any download buttons on the page
    document.querySelectorAll('.btn-download').forEach(guardDownloadLink);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
