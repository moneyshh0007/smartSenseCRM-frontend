# SmartSense CRM — Frontend Agent Instructions

This file tells AI assistants how to work in this repository.
Read it fully before writing any code or specs.

---

## Project

**SmartSense CRM** — Phase 1 Prototype  
A CRM tool for sales teams. Manages contacts, companies, deals, tasks, activities, and email.

**Repo type:** Frontend (static HTML + Vanilla JavaScript)  
**Deployed on:** Railway (GitHub push triggers auto-deploy)  
**Backend repo:** `smartsense-backend/` (Fastify API, separate deployment)

---

## Tech Stack

- **HTML/CSS/JS** — no frontend framework (no React, Vue, Next.js, etc.)
- **Each page** is a self-contained `.html` file at the project root
- **Global CSS** — `assets/styles.css` — contains the full design system (CSS custom properties)
- **Global JS** — `assets/chrome.js` — sidebar navigation, toast notifications, shared UI
- **API client** — `assets/api.js` — wraps all backend API calls, handles JWT from localStorage

---

## CSS Conventions

Always use the existing CSS custom properties from `assets/styles.css`. Never hardcode colours or spacing values.

Key variables:
```
--ink           main text colour (near-black)
--ink-70        secondary text
--ink-50        muted text
--ink-30        placeholder / disabled
--ink-10        subtle border
--ink-05        hover background
--ink-03        light hover
--paper         page background (white)
--paper-warm    slightly warm background (sidebars, inputs)
--rule          standard 1px border  →  border: var(--rule)
--rule-strong   thicker border
--radius        standard border-radius
--space-2..8    spacing scale (4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px)
--body          body font family
--mono          monospace font family
--shadow-pop    standard box shadow for modals/cards
```

---

## JavaScript Conventions

- **Vanilla JS only** — no npm packages, no `import`/`require` in frontend pages
- Use `var` (not `let`/`const`) for consistency with existing codebase
- DOM manipulation via `document.getElementById`, `innerHTML`, `classList`
- API calls via `SS_API.*` methods from `assets/api.js`
- Toast notifications via `window.SS_toast("message", { sub: "subtitle" })`
- Auth check at top of every page: `if (!SS_API.Auth.isLoggedIn()) window.location.href = "index.html";`
- Client-side state that needs to persist between page loads uses `localStorage`

---

## HTML Page Structure

Every page follows this shell:
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Page Name · SmartSense CRM</title>
  <link rel="stylesheet" href="assets/styles.css" />
  <style>/* page-specific CSS only */</style>
</head>
<body data-page="page-id" class="">
  <div class="app">
    <div data-sidebar></div>
    <main class="main">
      <div class="topbar">
        <div class="breadcrumb">...</div>
        <div class="topbar-actions">...</div>
      </div>
      <!-- page content -->
    </main>
  </div>
  <script src="assets/api.js"></script>
  <script>
    if (!SS_API.Auth.isLoggedIn()) window.location.href = "index.html";
    // page logic
  </script>
  <script src="assets/chrome.js"></script>
</body>
</html>
```

Note: `assets/chrome.js` is always the **last** script — it renders the sidebar after the page scripts run.

---

## UI Component Patterns

**Buttons:**
- `.btn` — standard button
- `.btn.primary` — primary action (dark background)
- `.btn.sm` — small button
- `<button class="icon-btn">` — icon-only button

**Modals / Overlays:**
- Overlay: `position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:300`
- Toggle with `.open` class + `display:flex`
- Close on backdrop click: `onclick="if(event.target===this) closeModal()"`

**Slide panels (detail views):**
- Right-side panel that slides in, 480px wide
- Used for contact detail, task detail, etc.

**Empty states:**
- Centered column, icon + heading + description + CTA button
- Use `--ink-30` colour for icon, `--ink-50` for description text

---

## OpenSpec Workflow

All new features and changes go through:
1. `/opsx:propose` — write the spec first, agree on what to build
2. Review and approve the spec
3. `/opsx:apply` — implement the spec
4. `/opsx:verify` — validate implementation matches spec
5. `/opsx:archive` — finalise and document

**Never write code for a new feature without an approved spec in `openspec/changes/`.**

Specs live in `openspec/specs/` (source of truth) and `openspec/changes/` (active work).

---

## What NOT to do

- Do not introduce npm packages or build tools to the frontend
- Do not use `let`/`const` — use `var` for consistency
- Do not hardcode colours, use CSS variables
- Do not add `console.log` statements in committed code
- Do not create new `.html` pages without a spec
- Do not modify `assets/chrome.js` or `assets/api.js` without a spec — these are shared globals
