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
    'rebuilding-account-security.html',
  ];

  // Run immediately (before body renders) to prevent any flash of content
  // on guarded pages for unauthenticated users.
  (function () {
    const path = window.location.pathname;
    if (GUARDED_PAGES.some(p => path.endsWith(p)) &&
        sessionStorage.getItem(SESSION_KEY) !== '1') {
      document.documentElement.style.visibility = 'hidden';
    }
  }());

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
  // onCancel = callback to run when the user cancels.
  function buildModal(label, buttonText, onSuccess, onCancel) {
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
        <a id="auth-cancel" href="#">Cancel</a>
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
        visibility: visible;
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
      #auth-cancel {
        font-family: 'Libre Franklin', sans-serif;
        font-size: 13px;
        font-weight: 300;
        color: #1C1C1A;
        opacity: 0.5;
        text-decoration: underline;
        letter-spacing: 0.02em;
        margin-block: -8px;
      }
      #auth-cancel:hover {
        opacity: 0.8;
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

    document.getElementById('auth-cancel').addEventListener('click', function (e) {
      e.preventDefault();
      if (onCancel) {
        onCancel();
      } else {
        overlay.remove();
        style.remove();
      }
    });
  }

  function isAuthenticated() {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  }

  // Full-page guard for case study pages
  function guardPage() {
    if (isAuthenticated()) {
      document.documentElement.style.visibility = '';
      return;
    }
    document.documentElement.style.overflow = 'hidden';
    buildModal('These case studies are password protected.', 'View case study', function () {
      document.documentElement.style.overflow = '';
      document.documentElement.style.visibility = '';
    }, function () {
      // Navigate back without removing the overlay — page stays hidden until gone
      document.documentElement.style.overflow = '';
      history.back();
    });
  }

  // Exposed globally so individual elements (e.g. download button) can
  // gate an action behind the password without blocking the whole page.
  window.requireAuth = function (callback) {
    if (isAuthenticated()) {
      callback();
      return;
    }
    buildModal('This resumé is password protected.', 'View resumé', callback);
  };

  function init() {
    const path = window.location.pathname;
    const isGuardedPage = GUARDED_PAGES.some(p => path.endsWith(p));

    if (isGuardedPage) {
      guardPage();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
