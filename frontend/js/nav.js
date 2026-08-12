// Shared hamburger nav drawer, included on index.html/compare.html/
// recommend.html. Injects its own markup (hamburger button into <header>,
// overlay + drawer appended to <body>) so all three pages share one literal
// copy of this DOM instead of three hand-authored copies that could drift
// out of sync — each page only needs the <script> tag, no other markup.

const NAV_PAGES = [
  {
    id: "map",
    href: "index.html",
    label: "Map",
    icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>`,
  },
  {
    id: "compare",
    href: "compare.html",
    label: "Compare suburbs",
    // Same rect coordinates as the "compare" icon in compare.js's empty
    // state — reused rather than redrawn, so the same concept looks the
    // same everywhere.
    icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false"><rect x="3" y="4" width="8" height="16" rx="2"/><rect x="13" y="4" width="8" height="16" rx="2"/></svg>`,
  },
  {
    id: "recommend",
    href: "recommend.html",
    label: "Find my suburb",
    icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false"><line x1="4" y1="8" x2="20" y2="8"/><circle cx="9" cy="8" r="2" fill="currentColor" stroke="none"/><line x1="4" y1="16" x2="20" y2="16"/><circle cx="15" cy="16" r="2" fill="currentColor" stroke="none"/></svg>`,
  },
];

const HAMBURGER_ICON = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;

function currentPageId() {
  const file = location.pathname.split("/").pop();
  if (file === "" || file === "index.html") return "map";
  if (file === "compare.html") return "compare";
  if (file === "recommend.html") return "recommend";
  return null;
}

function navDrawerLinkHtml(page, currentId) {
  const isCurrent = page.id === currentId;
  return `
    <li>
      <a href="${page.href}" class="nav-drawer-link"${isCurrent ? ' aria-current="page"' : ""}>
        ${page.icon}
        <span>${page.label}</span>
        ${
          isCurrent
            ? '<span class="nav-drawer-current-badge" aria-hidden="true">&check;</span><span class="visually-hidden"> (current page)</span>'
            : ""
        }
      </a>
    </li>
  `;
}

function navDrawerHtml(currentId) {
  return `
    <div id="nav-drawer-overlay" class="nav-drawer-overlay"></div>
    <div id="nav-drawer" class="nav-drawer" role="dialog" aria-modal="true" aria-label="Site navigation">
      <div class="nav-drawer-header">
        <span class="nav-drawer-title">Menu</span>
        <button type="button" id="nav-drawer-close" class="nav-drawer-close" aria-label="Close menu">&times;</button>
      </div>
      <nav aria-label="Pages">
        <ul class="nav-drawer-list">
          ${NAV_PAGES.map((p) => navDrawerLinkHtml(p, currentId)).join("")}
        </ul>
      </nav>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("header");
  if (!header) return;

  const menuBtn = document.createElement("button");
  menuBtn.type = "button";
  menuBtn.id = "nav-menu-btn";
  menuBtn.className = "nav-menu-btn";
  menuBtn.setAttribute("aria-label", "Menu");
  menuBtn.setAttribute("aria-expanded", "false");
  menuBtn.setAttribute("aria-controls", "nav-drawer");
  menuBtn.innerHTML = HAMBURGER_ICON;
  header.insertBefore(menuBtn, header.firstChild);

  document.body.insertAdjacentHTML("beforeend", navDrawerHtml(currentPageId()));

  const overlay = document.getElementById("nav-drawer-overlay");
  const drawer = document.getElementById("nav-drawer");
  const closeBtn = document.getElementById("nav-drawer-close");

  function openDrawer() {
    overlay.classList.add("nav-drawer-open");
    drawer.classList.add("nav-drawer-open");
    menuBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
    document.addEventListener("keydown", onKeydown);
  }

  function closeDrawer() {
    overlay.classList.remove("nav-drawer-open");
    drawer.classList.remove("nav-drawer-open");
    menuBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    menuBtn.focus();
    document.removeEventListener("keydown", onKeydown);
  }

  function onKeydown(e) {
    if (e.key === "Escape") closeDrawer();
  }

  menuBtn.addEventListener("click", openDrawer);
  closeBtn.addEventListener("click", closeDrawer);
  overlay.addEventListener("click", closeDrawer);
});
