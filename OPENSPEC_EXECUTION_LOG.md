# OpenSpec Framework — Execution Log

**Project:** SmartSense CRM Phase 1 Prototype  
**Backend:** `smartsense-backend` → Railway (`https://smartsensecrm-production.up.railway.app`)  
**Frontend:** static HTML → Railway (`https://smartsensecrm-frontend-production.up.railway.app`)  
**Last updated:** 17 Jun 2026

---

## What is the OpenSpec Framework?

OpenSpec is the spec-first development workflow used to convert the SmartSense CRM Phase 1 static prototype into a live, API-backed application. The workflow is:

```
proposal.md → design.md → tasks.md → implementation → deploy
```

Every feature begins with a specification that defines requirements, API shape, and acceptance scenarios before any code is written. Specs live in `openspec/specs/<module>/spec.md` (frontend) and `smartsense-backend/openspec/changes/<feature>/` (backend).

---

## Execution Index

| # | Phase | What was built | Status |
|---|-------|---------------|--------|
| 0 | Static Prototype | 28-page HTML/CSS/JS prototype | ✅ Complete |
| 1 | OpenSpec Setup | Framework init, AGENTS.md | ✅ Complete |
| 2 | Backend Bootstrap | Fastify server, Prisma, Railway deploy | ✅ Complete |
| 3 | Auth Module | Register / Login / JWT / auth guards | ✅ Complete |
| 4 | Contacts Module | Full CRUD + frontend wiring | ✅ Complete |
| 5 | Companies Module | Full CRUD + frontend wiring | ✅ Complete |
| 6 | Deals Module | Full CRUD + mark won/lost + frontend wiring | ✅ Complete |
| 7 | Tasks Module | Full CRUD + complete/reopen + frontend wiring | ✅ Complete |
| 8 | Activities Module | Create + list + frontend wiring | ✅ Complete |
| 9 | Gmail OAuth (Email) | OAuth connect/disconnect + real inbox sync | ✅ Complete |
| 10 | CSV Contact Import | 4-step wizard (upload/map/validate/execute) | ✅ Complete |
| 11 | Companies Pages QA | KPI grid, tab switching, edit company, notes | ✅ Complete |

---

## Execution Detail

---

### Phase 0 — Static Prototype

**Completed:** May 2026  
**Scope:** Full UI prototype with no backend.

28 HTML pages built covering the full CRM surface:
- `index.html` — Sign in / Register
- `my-day.html` — Dashboard
- `contacts.html`, `contact-detail.html`
- `companies.html`, `company-detail.html`
- `deals.html`, `deals-table.html`, `deals-table-junior.html`, `deals-forecast.html`, `deal-detail.html`
- `activities.html`, `tasks.html`
- `emails.html`
- `import-upload.html`, `import.html`, `import-review.html`, `import-progress.html`
- `dedup.html`, `chrome-extension.html`
- Settings pages: `settings.html`, `settings-workspace.html`, `settings-billing.html`, `settings-authentication.html`, `settings-roles.html`, `settings-audit-log.html`, `settings-data-model.html`, `settings-pipelines.html`, `settings-selling-rules.html`

Supporting files:
- `assets/styles.css` — 1,107-line design system
- `assets/chrome.js` — 1,654-line shared UI chrome (sidebar, slides, toasts, modals, role switcher)

All 28 pages: 0 broken links, 213 buttons wired, 5 chrome subsystems.

---

### Phase 1 — OpenSpec Framework Setup

**Commits:** `chore: OpenSpec Phase 1 — install, init, and AGENTS.md`  
**Scope:** Establish the spec-first workflow structure.

**What was done:**
- Created `openspec/` directory in the frontend repo
- Wrote `AGENTS.md` defining the OpenSpec workflow and agent roles
- Created initial spec stubs for frontend modules

**Frontend spec files created:**
- `openspec/specs/ui-auth/spec.md`
- `openspec/specs/ui-contacts/spec.md`
- `openspec/specs/ui-deals/spec.md`
- `openspec/specs/ui-tasks/spec.md`
- `openspec/specs/ui-email/spec.md`

---

### Phase 2 — Backend Bootstrap

**Commits:** `initial backend setup`, `add postinstall prisma generate`, `fix package.json and use tsx for production`  
**Repo:** `smartsense-backend`  
**Deployed to:** Railway

**Stack chosen:**
- **Runtime:** Node.js with TypeScript (`tsx` for production)
- **Framework:** Fastify (with `@fastify/jwt`, `@fastify/cors`, `@fastify/cookie`, `@fastify/swagger`)
- **ORM:** Prisma 7 with PostgreSQL
- **Database:** Neon PostgreSQL (serverless)
- **Docs:** `@scalar/fastify-api-reference` at `/docs`

**Prisma schema — initial models:**

| Model | Key fields |
|-------|-----------|
| `Workspace` | id, name, slug, region, plan |
| `User` | id, email, passwordHash, workspaceId |
| `Contact` | id, firstName, lastName, email, phone, title, location, linkedinUrl, source, companyId |
| `Company` | id, name, domain, industry, size, hq |
| `Deal` | id, name, amount, stage, pipeline, closeDate, companyId |
| `Task` | id, title, dueAt, priority, completed, completedAt, contactId, dealId |
| `Activity` | id, type, title, body, contactId, dealId |
| `AuditLog` | id, action, objectType, objectId, actorId, diff |

**API client (`assets/api.js`) created** with `apiFetch()` base, auth guards, and the following service objects exported via `window.SS_API`:
- `Auth` — login, register, me, logout, isLoggedIn
- `Contacts` — list, get, create, update, delete
- `Companies` — list, get, create, update
- `Deals` — list, get, create, update, markWon, markLost
- `Tasks` — list, create, update, delete
- `Activities` — list, create

---

### Phase 3 — Auth Module

**Spec:** `openspec/specs/ui-auth/spec.md`  
**Commits:** `feat: add auth guards to 20 HTML pages`  
**Frontend:** `index.html`  
**Backend:** `src/routes/auth.ts`

**Backend endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Create workspace + first admin user |
| POST | `/auth/login` | Password login, returns JWT |
| GET | `/auth/me` | Returns authenticated user + workspace |

**Frontend changes:**
- Login and register forms wired to `SS_API.Auth.login()` / `SS_API.Auth.register()`
- JWT stored in `localStorage` as `ss_token`; user + workspace stored as `ss_user`, `ss_workspace`
- Auth guard added to all 28 pages: `if (!SS_API.Auth.isLoggedIn()) window.location.href = "index.html";`
- Slug auto-generated from workspace name on register form
- Inline error messages on both forms

**Acceptance scenarios verified:**
- ✅ Successful login → redirect to `my-day.html`
- ✅ Wrong credentials → inline error, stays on page
- ✅ Successful registration → workspace created, redirected
- ✅ Unauthenticated access to any page → redirected to login

---

### Phase 4 — Contacts Module

**Spec:** `openspec/specs/ui-contacts/spec.md`  
**Commits:** `contact detail: fully dynamic page with context-aware breadcrumbs`, `contacts: add filter dropdown with field, operator, value, and active filter chips`, `contacts: show delete button when contacts are checked`, `contact detail: add delete contact button`, `task: contact-detail wire tabs, add Edit details slide, Notes tab`  
**Frontend:** `contacts.html`, `contact-detail.html`  
**Backend:** `src/routes/contacts.ts`

**Backend endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/contacts` | List all contacts (with company relation) |
| GET | `/contacts/:id` | Get contact with company, deals, activities |
| POST | `/contacts` | Create contact |
| PATCH | `/contacts/:id` | Partial update |
| DELETE | `/contacts/:id` | Delete contact (with audit log) |

**`contacts.html` changes:**
- List loads from `GET /contacts` on mount
- Client-side search (name, email, company — case-insensitive)
- Filter dropdown: field + operator + value; active filter chips
- Checkbox selection with bulk delete calling `DELETE /contacts/:id` per selected row
- "New Contact" button opens `new-contact` slide → `POST /contacts` → list refreshes
- Row click navigates to `contact-detail.html?id=xxx`
- KPI strip shows real contact count, total companies count

**`contact-detail.html` changes:**
- Loads contact via `GET /contacts/:id` on mount
- Tab switching wired (Timeline / Emails / Notes / Tasks / Files) via `DOMContentLoaded`
- **Edit Details** slide: pre-filled with current contact data, saves via `PATCH /contacts/:id`, refreshes all `dd` fields live
- **Notes tab:** "+ Add note" creates an Activity (type=`note`); `loadNotes()` filters activities by type on load
- **Files tab:** stub with "+ Attach file" showing "coming soon" toast
- **Timeline tab:** activities loaded from `GET /activities`, rendered as timeline items
- Delete button with confirmation modal → `DELETE /contacts/:id` → redirect to contacts list
- Context-aware breadcrumbs: shows "from company" or "from deal" when navigated via a detail page

**Acceptance scenarios verified:**
- ✅ List loads with all contacts
- ✅ Search filters results in real time
- ✅ New contact → appears at top of list
- ✅ Edit contact → fields update live without page refresh
- ✅ Delete contact → removed from list
- ✅ Tabs switch correctly; Notes tab saves and loads

---

### Phase 5 — Companies Module

**Spec:** (inferred from backend routes — no dedicated frontend spec file)  
**Commits:** `company detail: fully dynamic page`, `company detail: fix loading issues`, `feat: wire companies and company-detail pages to live backend`  
**Frontend:** `companies.html`, `company-detail.html`  
**Backend:** `src/routes/companies.ts`

**Backend endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/companies` | List all companies (with `_count: { contacts, deals }`) |
| GET | `/companies/:id` | Get company with contacts + deals arrays |
| POST | `/companies` | Create company (duplicate name check) |
| PATCH | `/companies/:id` | Partial update |
| DELETE | `/companies/:id` | Delete company |

**`companies.html` changes:**
- List loads from `GET /companies` on mount
- **KPI grid (real data):**
  - Total companies
  - Companies with open deals (+ % of total)
  - Total contacts across all companies
  - Companies added in last 30 days
- Filter dropdown: Company name, Industry, Size, Open deals
- Table columns: Company + domain, Industry, Size, Contacts count, Open deals count, Added date
- Row click navigates to `company-detail.html?id=xxx`
- "New company" button opens `new-company` slide → `SS_API.Companies.create()` → list refreshes
- `window.SS_loadCompanies` exposed so chrome.js can refresh after create

**`company-detail.html` changes:**
- Loads company via `GET /companies/:id` on mount; stores result in `COMPANY` state var
- Tab switching wired (Timeline / People / Deals / Notes) via `DOMContentLoaded`
- **KPIs:** Open deals count, People count, Activities (30d), Last activity
- **People tab:** loads `GET /contacts`, filters by `companyId` client-side, links to contact-detail
- **Deals tab:** loads `GET /deals`, filters by `companyId` client-side, links to deal-detail
- **Timeline tab:** loads `GET /activities`, shows latest 20 sorted descending
- **Notes tab:** "+ Add note" creates Activity (type=`note`); `loadNotes()` lists them
- **Edit Details** slide: pre-filled fields (name, domain, industry, size, HQ), saves via `PATCH /companies/:id`, refreshes Details card live
- Sidebar: People mini-list (top 5), Open Deals mini-list (top 4)

**`assets/chrome.js` fix:**
- `SS_openSlide()` updated to accept both a string form-key (existing usage) and a **direct config object** — fixing the Edit slides on contact-detail and company-detail which were silently failing

---

### Phase 6 — Deals Module

**Spec:** `openspec/specs/ui-deals/spec.md`  
**Commits:** `deal detail: fully dynamic page with real data per deal ID`, `deals kanban: horizontal layout with scroll, drag and drop between stages`, `deals kanban: dynamic filter panel`  
**Frontend:** `deals.html`, `deal-detail.html`  
**Backend:** `src/routes/deals.ts`

**Backend endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/deals` | List all deals (optional `?pipeline=`, `?stage=`) |
| GET | `/deals/:id` | Get deal with company, contacts, activities |
| POST | `/deals` | Create deal |
| PATCH | `/deals/:id` | Partial update (stage, amount, etc.) |
| DELETE | `/deals/:id` | Delete deal |
| POST | `/deals/:id/won` | Mark deal Closed Won |
| POST | `/deals/:id/lost` | Mark deal Closed Lost (requires `lostReason`) |

**`deals.html` changes:**
- Kanban board loads from `GET /deals` on mount; cards grouped by stage
- Horizontal scroll for stage columns
- Drag-and-drop between columns calls `PATCH /deals/:id` with new `stage`
- Filter panel: pipeline selector, stage multi-select, live filtering
- "New Deal" button opens `new-deal` slide → `POST /deals` → board refreshes

**`deal-detail.html` changes:**
- Loads deal via `GET /deals/:id` on mount
- Stage selector calls `PATCH /deals/:id` on change
- Activity timeline, contacts list, files/links tabs
- Mark Won button → `POST /deals/:id/won` → injects won-banner, hides button
- Mark Lost button → form with `lostReason` → `POST /deals/:id/lost`

---

### Phase 7 — Tasks Module

**Spec:** `openspec/specs/ui-tasks/spec.md`  
**Commits:** `tasks: all rows clickable, linked tasks navigate to record`, `task-detail: make all fields editable with save and mark-complete`, `fix: New Task button on tasks page opens slide panel`, `tasks: select all checkbox, bulk complete and delete actions`  
**Frontend:** `tasks.html`  
**Backend:** `src/routes/tasks.ts`

**Backend endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/tasks` | List tasks (`?completed=true/false`, `?contactId=`, `?dealId=`) |
| POST | `/tasks` | Create task |
| PATCH | `/tasks/:id` | Update task (title, dueAt, priority, completed) |
| DELETE | `/tasks/:id` | Delete task |

**`tasks.html` changes:**
- List loads from `GET /tasks` on mount (default: incomplete tasks)
- Filter toggle: All / To do / Completed — passes `?completed=` to API
- Overdue tasks highlighted (dueAt in past, not completed)
- Row click opens task detail slide-over with all fields editable
- **Mark complete:** checkbox → `PATCH /tasks/:id { completed: true }` → row strike-through
- **Task detail slide:** edit title, due date, priority; save calls `PATCH /tasks/:id`; "Mark complete" button calls same
- Linked contact/deal names clickable → navigate to respective detail page
- Bulk actions: select all, bulk complete, bulk delete
- "New Task" button opens `new-task` slide → `POST /tasks` → list refreshes

---

### Phase 8 — Activities Module

**Commits:** `activity rows click through to detail page with section highlight`  
**Frontend:** `activities.html`  
**Backend:** `src/routes/activities.ts`

**Backend endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/activities` | List activities (`?contactId=`, `?dealId=`, `?limit=`) |
| POST | `/activities` | Create activity (type, title, body, contactId, dealId) |

**`activities.html` changes:**
- Feed loads from `GET /activities` on mount
- Activity rows clickable — navigate to linked contact or deal detail page
- Activity type badge (MEETING, EMAIL, CALL, NOTE)
- Filter by type (client-side)

**Activities used across modules:**
- Contact Notes tab: `POST /activities` with `type=note`, `contactId`
- Company Notes tab: `POST /activities` with `type=note`
- Deal timeline: `GET /activities?dealId=xxx`
- My Day recent activity strip: `GET /activities?limit=5`

---

### Phase 9 — Gmail OAuth (Email Module)

**Spec:** `openspec/specs/ui-email/spec.md`  
**Commits:** `feat: add Gmail OAuth and real inbox sync for Email module` (backend), `feat: wire Email module to real Gmail OAuth backend` (frontend), `fix: decode Gmail HTML entities in email snippets and body`  
**Frontend:** `emails.html`  
**Backend:** `src/routes/email.ts`

**Backend endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/email/auth-url` | Generate Google OAuth consent URL |
| GET | `/email/callback` | Handle OAuth code → exchange for tokens → encrypt + store |
| GET | `/email/status` | Returns `{ connected, email }` |
| GET | `/email/messages` | List inbox messages via Gmail API |
| DELETE | `/email/disconnect` | Remove stored tokens |

**OAuth flow:**
1. Frontend calls `GET /email/auth-url` → backend returns Google consent URL
2. User authorises → Google redirects to `OAUTH_REDIRECT_BASE_URL/email/callback`
3. Callback page exchanges code → backend stores encrypted tokens
4. `emails.html` polls `GET /email/status` to detect connection

**Token storage:**
- Access + refresh tokens encrypted with AES-256-GCM using `TOKEN_ENCRYPTION_KEY`
- Stored in `EmailConnection` Prisma model linked to the user

**`emails.html` changes:**
- On load: checks `GET /email/status`
  - **Not connected:** shows connect screen → provider modal → Gmail auth consent → OAuth flow
  - **Connected:** shows full 3-column email client (folders / list / detail)
- Email list pulls from `GET /email/messages`; shows real Gmail inbox
- HTML entities in Gmail snippets decoded via `decodeHtmlEntities()` (textarea DOM trick — XSS-safe)
- Disconnect button → `DELETE /email/disconnect` → returns to connect screen

**Pre-flight requirements:**
- Google Cloud Console: OAuth client ID + secret configured, `OAUTH_REDIRECT_BASE_URL` added as authorised redirect URI
- Railway env vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `TOKEN_ENCRYPTION_KEY`, `OAUTH_REDIRECT_BASE_URL`

**Acceptance scenarios verified:**
- ✅ First visit shows connect screen
- ✅ OAuth flow completes and real Gmail inbox loads
- ✅ HTML entities (`&#39;` etc.) decode to readable characters
- ✅ Disconnect returns to connect screen without affecting CRM data

---

### Phase 10 — CSV Contact Import

**Commits:** `feat: CSV contact import — upload, map, validate, execute endpoints` (backend), `feat: CSV import frontend — upload, map, review, progress pages wired to API` (frontend)  
**Frontend:** `import-upload.html`, `import.html`, `import-review.html`, `import-progress.html`  
**Backend:** `src/routes/imports.ts`  
**Migration:** `prisma/migrations/20260617105853_add_import_job/`

**New Prisma model — `ImportJob`:**

```
id, workspaceId, userId, filename, status, headers (JSON), rows (JSON),
mappings (JSON?), totalRows, validRows, duplicates, errorCount, imported,
errors (JSON?), createdAt, updatedAt
```

Status machine: `uploaded → mapped → validated → importing → completed`

**Backend endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/imports/upload` | Parse CSV (papaparse), store raw rows, return suggestions |
| POST | `/imports/:jobId/mappings` | Save column→field mappings |
| GET | `/imports/:jobId/validate` | Validate rows, detect email duplicates |
| POST | `/imports/:jobId/execute` | Bulk create contacts + companies |
| GET | `/imports/:jobId` | Get full job state |

**Column auto-mapping:**
- `FIELD_MAP` dictionary normalises CSV header variants (e.g. `"work_email"` → `email`, `"full_name"` → `fullName`)
- Suggestions returned with `GET /imports/:jobId` and shown as pre-selected dropdowns

**Duplicate detection:**
- Batch-query existing contacts by email before validation
- Per-row duplicate check during execute (re-queries to handle concurrent imports)

**Company auto-creation:**
- `getOrCreateCompany()` upserts by name (case-insensitive), caches in `Map` during execute

**`import-upload.html`:**
- Drag-and-drop zone + file browser
- Calls `SS_API.Imports.upload(file)` via raw `fetch` + `FormData` (no Content-Type override)
- On success: shows filename + row count, enables "Continue" button storing `pendingJobId`
- Navigates to `import.html?jobId=xxx`

**`import.html` (column mapping):**
- Loads job via `SS_API.Imports.getJob(jobId)`
- Renders table of CSV columns with `<select>` dropdowns pre-filled from auto-suggestions
- "N of M AUTO-MAPPED" badge shows coverage
- "Continue to review" → saves mappings → runs validate → navigates to review

**`import-review.html`:**
- Loads job state; populates KPI grid (will import / duplicates / errors / total)
- Renders sample of valid rows table
- Error list (up to 10 shown)
- Import options: skip duplicates, skip errors
- "Import N records" button → `SS_API.Imports.execute()` → navigates to progress

**`import-progress.html`:**
- Polls `SS_API.Imports.getJob(jobId)` every 1.5 seconds
- Updates progress bar, imported/skipped/errors counts
- On `status === "completed"`: stops polling, shows completion banner with final counts
- "View Contacts" navigates to `contacts.html`

**`assets/api.js` — `SS_API.Imports` added:**

```javascript
upload(file)              // raw fetch + FormData (no JSON Content-Type)
saveMappings(jobId, mappings)
validate(jobId)
execute(jobId, options)
getJob(jobId)
```

---

### Phase 11 — Companies Pages QA

**Commits:** `feat: wire companies and company-detail pages to live backend`  
**Frontend:** `companies.html`, `company-detail.html`, `assets/chrome.js`

**Issues found and fixed:**

| Issue | Fix |
|-------|-----|
| KPI grid showed hardcoded static numbers (412, 89, $1.24M, 847) | Replaced with real computed values from API response |
| Table "Pipeline value" column always "—" (not available from API) | Replaced with Contacts count and Added date columns |
| Table "Owner" column always "—" (ownerId not resolved to name) | Removed (ownerId only, no join in list query) |
| Tabs on company-detail non-functional (no event listeners) | Added `DOMContentLoaded` tab-switching listener |
| No way to edit company details | Added "Edit" button → pre-filled slide-over → `PATCH /companies/:id` |
| Notes tab showed hardcoded placeholder text | Replaced with "+ Add note" toolbar + `loadNotes()` function |
| `SS_openSlide({...})` silently failed when passed an object config | Fixed `SS_openSlide` in chrome.js to accept both string keys and direct config objects |
| `detail-owner` row referenced `c.owner` which doesn't exist in API response | Removed Owner row from Details card |

---

## Pending / Upcoming

| Item | Notes |
|------|-------|
| Deals page deep QA | Verify kanban drag-and-drop, mark won/lost flow on Railway |
| Tasks page deep QA | Verify bulk complete, task detail edit, linked record nav |
| My Day dashboard | Verify real KPIs (stalled deals, tasks due today) load correctly |
| Activities page | Verify feed loads, type filter works |
| Settings pages | Remain static prototype — backend integration deferred to Phase 2 |
| Companies: pipeline value | Requires `GET /companies` to aggregate deal amounts (backend change needed) |
| Notes: company-scoped | Activities model has no `companyId` — notes on company-detail show all workspace notes |

---

## Environment Reference

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | Signs all auth tokens |
| `TOKEN_ENCRYPTION_KEY` | AES-256-GCM key for Gmail OAuth tokens |
| `GOOGLE_CLIENT_ID` | OAuth app client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth app client secret |
| `OAUTH_REDIRECT_BASE_URL` | Must match Google Console authorised redirect (Railway frontend URL) |
| `CORS_ORIGIN` | Comma-separated allowed origins |
| `PORT` | Set automatically by Railway |

---

*Document maintained as part of the OpenSpec Framework execution log. Update this file after each implementation phase.*
