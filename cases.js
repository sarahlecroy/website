// ── Case study data ────────────────────────────────────────
// Edit this file to update case studies on both index.html and work.html.

const CASES = [
  {
    image:    'images/coverimages/ai_powered_autofill.gif',
    alt:      'Image preview for AI-Powered Autofill case study',
    subtitle: 'Intuit Mailchimp',
    title:    'AI-Powered Setup',
    href:     'ai-powered-setup.html',
  },
  {
    image:    'images/coverimages/scalablesystemsforsetupguidance.webp',
    alt:      'Image preview for Personalized Setup Task List case study',
    subtitle: 'Intuit Mailchimp',
    title:    'Scalable Systems for Setup Guidance',
    href:     'scalable-setup-guidance.html',
  },
  {
    image:    'images/coverimages/accountsetupoptimization.webp',
    alt:      'Image preview for Account Setup Optimization case study',
    subtitle: 'Intuit Mailchimp',
    title:    'Account Setup Optimization',
    href:     'account-setup-optimization.html',
  },
  {
    image:    'images/coverimages/twofactor.webp',
    alt:      'Image preview for Two-Factor Authentication case study',
    subtitle: 'Intuit Mailchimp',
    title:    'Modernizing Account Security at Scale',
    href:     'account-security-2fa.html',
  },
];

function renderCases(gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = CASES.map(c => {
    const inner = `
      <div class="case-media" ${c.dimmed ? 'style="opacity:0.5;"' : ''}>
        <img src="${c.image}" alt="${c.alt}">
      </div>
      <p class="case-subtitle">${c.subtitle}</p>
      <h3 class="case-subhead">${c.title}</h3>
    `;
    return c.href
      ? `<article class="case"><a href="${c.href}" style="text-decoration:none;color:inherit;display:block;">${inner}</a></article>`
      : `<article class="case">${inner}</article>`;
  }).join('');
}
