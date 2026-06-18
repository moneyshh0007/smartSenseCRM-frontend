# OpenSpec Framework — Execution Log

**Project:** SmartSense CRM Phase 1 Prototype  
**Backend:** `smartsense-backend` → Railway (`https://smartsensecrm-production.up.railway.app`)  
**Frontend:** static HTML → Railway (`https://smartsensecrm-frontend-production.up.railway.app`)  
**Last updated:** 18 Jun 2026 (Phase 2 complete)

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
| 12 | Deals Pages QA | KPI grid real data, deal-detail Mark Won/Lost, Edit, Notes | ✅ Complete |
| 13 | My Day + Tasks QA | Fix greeting crash, undefined KPI counts, tasks count display | ✅ Complete |
| 14 | Deals Table + Forecast | Wire deals-table.html and deals-forecast.html to live API | ✅ Complete |
| 15 | Dedup + Settings Workspace | Client-side duplicate detection; settings-workspace populated from auth | ✅ Complete |
| 16 | Audit Log | Backend GET /audit-logs route; settings-audit-log.html wired with KPIs + client-side filter | ✅ Complete |
| 17 | Companies Pipeline Value | Fetch deals in parallel with companies; show open pipeline per company in table + KPI | ✅ Complete |
| 18 | Contact + Company Detail QA | Fix user name bug in timelines; server-side contactId filtering; remove double contact fetch | ✅ Complete |
| 19 | Contacts + Deals Kanban QA | Fix data.total undefined; fix initials crash; wire kanban drag-drop to Deals.update() | ✅ Complete |
| 20 | Tasks owner + Company notes scoping | Add owner join to GET /tasks; tasks.html shows owner name; company-detail notes scoped to company contacts | ✅ Complete |
| 21 | Deal owner name fix | Fix d.owner.firstName/lastName → d.owner.name in deal-detail, deals-table, company-detail deals tab | ✅ Complete |
| 22 | User name field QA sweep | Fix user.firstName → user.name across my-day greeting, deals-forecast, and deals-table owner column | ✅ Complete |
| 23 | Deal contacts dedup + source fields | Eliminate duplicate API call in deal-detail loadContacts(); extend contacts select with source + createdAt | ✅ Complete |
| 24 | Server-side companyId filtering | Add ?companyId filter to GET /contacts and GET /deals; update api.js Contacts.list(); fix contact-detail task filter | ✅ Complete |
| 25 | Slide context linkage (create forms) | Wire companyId/contactId/dealId from ctx into new-contact, new-deal, new-task onSave payloads | ✅ Complete |
| 26 | Activity context + deal Tasks tab | Wire new-activity slide ctx; remove broken linked-record freetext; add Tasks tab to deal-detail | ✅ Complete |
| 27 | Tasks API contact/deal includes | GET /tasks now returns nested contact and deal objects; contact-detail task checkboxes functional | ✅ Complete |
| 28 | Company-detail activity scoping | Timeline filtered to company's own contacts; activity dates use occurredAt; boot sequence fixed | ✅ Complete |
| 29 | occurredAt required field fix | Add occurredAt to all openAddNote() calls (was returning 400); fix deal-detail activity sort dates | ✅ Complete |

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

### Phase 12 — Deals Pages QA

**Commits:** `deals: wire deals.html KPIs and deal-detail.html to live backend`  
**Frontend:** `deals.html`, `deal-detail.html`

**Issues found and fixed:**

| Issue | Fix |
|-------|-----|
| KPI grid on `deals.html` showed hardcoded values | Replaced with real computed values: pipeline sum, stalled count, total deals, closing this month |
| Mark Won / Mark Lost buttons always hidden | Buttons now visible for open deals (`Discovery` → `Negotiation`), hidden when already `Closed Won`/`Closed Lost` |
| No way to edit deal details from the detail page | Added "Edit" button → pre-filled slide (name, amount, stage, pipeline, closeDate) → `PATCH /deals/:id` → live refresh |
| Notes tab had static placeholder text | Replaced with `+ Add note` toolbar and `loadNotes()` function |
| `loadActivities()` fetched all activities and filtered client-side | Changed to `GET /activities?dealId=xxx` (server-side filter); notes excluded from timeline (type !== "note") |
| `DEAL` state not stored | Added `var DEAL = {}` state variable; stored in `loadDeal()` after fetch so Edit slide can pre-fill fields |

**New JS functions added to `deal-detail.html`:**

| Function | What it does |
|----------|-------------|
| `esc(s)` | HTML-escape helper for safe innerHTML injection |
| `markDealWon()` | Confirms, calls `SS_API.Deals.markWon(id)`, injects green won-banner, hides buttons |
| `openMarkLost()` | Opens slide with `lostReason` textarea, calls `SS_API.Deals.markLost(id, reason)`, injects red lost-banner |
| `openEditDeal()` | Opens pre-filled slide (name, amount, stage, pipeline, closeDate), saves via `SS_API.Deals.update()`, refreshes all detail fields live |
| `openAddNote()` | Opens slide with textarea, creates activity with `type="note"` and `dealId` |
| `loadNotes()` | Fetches `GET /activities?dealId=xxx`, filters `type==="note"`, renders note-items sorted newest-first |

---

### Phase 13 — My Day + Tasks QA

**Commits:** `fix: my-day greeting crash, undefined KPI counts, tasks count display`  
**Frontend:** `my-day.html`, `tasks.html`

**Issues found and fixed:**

| File | Issue | Fix |
|------|-------|-----|
| `my-day.html` | `user.name` crashes — API returns `firstName`/`lastName`, not `name` | Changed to `user.firstName \|\| user.email.split("@")[0]` |
| `my-day.html` | KPI cards showed "undefined" for activities and tasks counts (`.total` not in API response) | Replaced `activitiesData.total`, `tasksData.total`, `dealsData.total` with array `.length` |
| `my-day.html` | Activity timeline showed "Invalid Date" — `occurredAt` not always present | Added `a.occurredAt \|\| a.createdAt` fallback |
| `tasks.html` | Subtitle and footer showed "undefined open tasks" / "SHOWING undefined TASKS" | Replaced `data.total` with `data.tasks.length` |

**No issues found in `activities.html`** — already uses `data.activities` and `_allActs.length` correctly.

---

### Phase 14 — Deals Table + Forecast Pages

**Commits:** `deals: wire deals-table and deals-forecast pages to live backend`  
**Frontend:** `deals-table.html`, `deals-forecast.html`

**`deals-table.html` changes:**
- All hardcoded rows replaced with real `GET /deals` data
- KPIs now real: total deals, open pipeline, avg deal size, win rate (all-time)
- Stalled/ROTTING badge appears for deals with `updatedAt` > 21 days ago
- Row click navigates to `deal-detail?id=xxx`
- Competitor column removed (field not returned by `GET /deals`)
- "+ New deal" button wired to `SS_openSlide('new-deal')`
- Footer shows real count

**`deals-forecast.html` changes:**
- All hardcoded KPIs replaced: Closed Won YTD, Commit, Best Case, Pipeline
- Dynamic roll-up bar chart: bar widths computed as % of max value
- "By category" table: rows generated from real deals grouped by `forecastCategory`
- Weighted amount column: `amount × probability / 100`
- Won/Lost analysis:
  - Lost: real `lostReason` field grouped and ranked by frequency
  - Won: total won deals count + value

---

### Phase 15 — Dedup + Settings Workspace

**Commits:** `dedup + settings: wire dedup page with client-side email/name detection; settings-workspace shows real data`  
**Frontend:** `dedup.html`, `settings-workspace.html`

**`dedup.html` changes:**
- Loads all contacts from `GET /contacts` on mount and on "Re-scan"
- **HIGH CONFIDENCE clusters**: contacts sharing the exact same email address
- **NEEDS REVIEW clusters**: contacts with the same full name but different emails
- Real KPIs: Total People, Duplicate clusters (% of records), High confidence count, Needs review count
- Dynamic cluster cards with radio-button "Keep?" selection (top contact pre-selected)
- "Skip cluster" removes cluster from view without deleting anything
- "Merge into selected" — deletes non-selected contacts via `DELETE /contacts/:id`
- "Bulk-merge all high-confidence" — auto-deletes all extras in high-confidence clusters
- Clean state card shown when no clusters remain: "Your data is clean ✓"
- **Known limitation**: simplified merge (deletes duplicates without combining activities/deals — full merge deferred to Phase 2)

**`settings-workspace.html` changes:**
- Workspace name and slug pre-filled from `ss_workspace` localStorage (set during login/register)
- Page subtitle shows real workspace name + creation date + plan
- "Save changes" updates localStorage and refreshes subtitle with toast notification

---

### Phase 16 — Audit Log

**Commits (backend):** `feat: add GET /audit-logs endpoint with workspace-scoped filtering`  
**Commits (frontend):** `feat(phase-16): wire settings-audit-log to live GET /audit-logs endpoint`  
**Backend:** `src/routes/audit-log.ts` (new), `src/server.ts` (registered)  
**Frontend:** `settings-audit-log.html`, `assets/api.js`

**Backend changes (`src/routes/audit-log.ts`):**
- `GET /audit-logs` — authenticated, workspace-scoped
- Query params: `objectType`, `objectId`, `actorId`, `action` (case-insensitive contains), `limit` (default 100)
- Includes `actor` join: `{ id, name, email }` from User model
- Returns `{ auditLogs: [...], total: N }`
- Registered in `server.ts` alongside all other route modules

**`assets/api.js` changes:**
- Added `AuditLogs` namespace with `list(params)` method
- Exported on `window.SS_API`

**`settings-audit-log.html` changes:**
- Removed all static rows; tbody now `id="audit-tbody"` — fully dynamic
- KPI IDs wired: `kpi-total`, `kpi-week`, `kpi-schema`, `kpi-role`
- `loadAuditLog()` loads latest 200 entries, computes KPIs client-side:
  - **Total entries**: count of loaded logs
  - **This week**: entries with `createdAt` > 7 days ago
  - **Schema changes**: actions containing "schema", "pipeline", or "field"
  - **Role changes**: actions/objectType containing "role"
- Actor display: resolves `log.actor.name` or `log.actor.email` (system entries show "system")
- Action badge: colour-coded (CREATE → solid, DELETE → warn, won → solid, etc.)
- Client-side filter: Actor name (substring), Object type (dropdown), Action type (dropdown)
- "Apply" / "Clear" buttons re-render without re-fetching

---

### Phase 17 — Companies Pipeline Value

**Frontend:** `companies.html`

**Issues found and fixed:**

| Issue | Fix |
|-------|-----|
| Companies table showed no pipeline value — deals not fetched on companies page | Load `GET /deals` in parallel with `GET /companies`; build `pipelineMap[companyId] = { count, value }` from open deals |
| KPI "Total pipeline" always "—" | Computed from `pipelineMap` values summed across all companies |

**Result:** Companies table now shows per-company open deal count + pipeline value. KPI grid shows real total pipeline and "N companies with open deals" sub-line.

---

### Phase 18 — Contact + Company Detail QA

**Frontend:** `contact-detail.html`, `company-detail.html`

**Issues found and fixed:**

| Issue | Fix |
|-------|-----|
| Activity timeline on contact-detail showed `user.firstName` — field doesn't exist on User model | Changed to `a.user.name` |
| contact-detail `loadTasks()` fetched all workspace tasks and filtered client-side | Changed to `SS_API.Tasks.list({ contactId })` (server-side filter) |
| company-detail `loadContacts()` fetched all workspace contacts and filtered by `companyId` client-side | Changed to `SS_API.Contacts.list({ companyId })` (requires backend companyId filter — deferred) |

---

### Phase 19 — Contacts + Deals Kanban QA

**Frontend:** `contacts.html`, `deals.html`

**Issues found and fixed:**

| Issue | Fix |
|-------|-----|
| `data.total` undefined on contacts page — API returns `contacts` array without `.total` | Replaced `data.total` with `data.contacts.length` |
| `initials()` crashed when `c.firstName` or `c.lastName` was null | Added `(c.firstName\|\|"?")[0]` fallback |
| Kanban drag-and-drop in `deals.html` never called the API — stage change was visual only | Added `SS_API.Deals.update(id, { stage })` call on drop |

---

### Phase 20 — Tasks Owner Name + Company Notes Scoping

**Files:** `smartsense-backend/src/routes/tasks.ts`, `tasks.html`, `company-detail.html`

**Issues found and fixed:**

| Issue | Fix |
|-------|-----|
| `tasks.html` Owner column always "—" — `GET /tasks` returned no owner data | Added `include: { owner: { select: { id, name } } }` to tasks findMany |
| `tasks.html` owner column rendered `t.owner` as object | Changed to `t.owner ? t.owner.name : "—"` |
| Company-detail Notes tab showed all workspace notes (no company scoping) | Rewrote `loadNotes()` to filter by contactIds of company's contacts |
| "+ Add note" on company-detail created a floating note with no linkage | `openAddNote()` now passes `contactId: _companyContacts[0].id` |
| `loadNotes()` ran before `loadContacts()` — `_companyContacts` was empty | Boot sequence changed to `loadContacts().then(() => loadNotes())` |

---

### Phase 21 — Deal Owner Name Fix

**Files:** `deal-detail.html`, `deals-table.html`, `deals-forecast.html`, `company-detail.html`

**Issue:** All four files used `d.owner.firstName + " " + d.owner.lastName` — User model has a single `name` field, not separate first/last.

**Fix:** Replaced with `d.owner.name || "—"` in all four files (4 call sites total).

---

### Phase 22 — User Name Field QA Sweep

**Files:** `my-day.html`, `deals-forecast.html`, `deals-table.html`

**Issue:** Remaining uses of `user.firstName` (greeting) and `a.user.firstName/lastName` (activity rows) after Phase 21.

| File | Location | Fix |
|------|----------|-----|
| `my-day.html` | Greeting line | `user.firstName \|\| email.split("@")[0]` → `user.name \|\| email.split("@")[0]` |
| `deals-forecast.html` | Owner column in forecast table | `d.owner.firstName + " " + d.owner.lastName` → `d.owner.name \|\| "—"` |
| `deals-table.html` | Owner column in deals table | Same fix |

---

### Phase 23 — Deal Contacts Dedup + Source Fields

**Files:** `smartsense-backend/src/routes/deals.ts`, `deal-detail.html`

**Issues found and fixed:**

| Issue | Fix |
|-------|-----|
| `deal-detail.loadContacts()` called `SS_API.Deals.get(dealId)` a second time — duplicate API call | Removed second API call; `loadContacts()` now reads synchronously from `DEAL.contacts` (already populated by `loadDeal()`) |
| Contact rows in deal-detail missing Source and Created columns | Extended `GET /deals/:id` contacts select to include `source: true, createdAt: true` |
| `loadContacts()` ran before `DEAL` was populated | Boot changed to `loadDeal().then(() => loadContacts())` |

---

### Phase 24 — Server-Side companyId Filtering

**Files:** `smartsense-backend/src/routes/contacts.ts`, `smartsense-backend/src/routes/deals.ts`, `assets/api.js`, `company-detail.html`, `contact-detail.html`

**Issues found and fixed:**

| Issue | Fix |
|-------|-----|
| `GET /contacts` had no filter params — all contacts fetched and filtered client-side | Added `?companyId` querystring to contacts route; handler applies `where.companyId` when present |
| `GET /deals` had no `?companyId` filter | Same addition to deals route |
| `api.js Contacts.list()` accepted no params | Updated to accept `params` object and serialise as `URLSearchParams` |
| company-detail `loadContacts()` loaded all workspace contacts | Changed to `SS_API.Contacts.list({ companyId })` |
| company-detail `loadDeals()` loaded all workspace deals | Changed to `SS_API.Deals.list({ companyId })` |
| contact-detail `loadTasks()` loaded all workspace tasks | Changed to `SS_API.Tasks.list({ contactId })` |

---

### Phase 25 — Slide Context Linkage (Create Forms)

**Files:** `assets/chrome.js`, `company-detail.html`, `contact-detail.html`

**Problem:** All three create slides (`new-contact`, `new-deal`, `new-task`) accepted a `ctx` parameter but ignored it — no linkage IDs were passed into the API payload.

**Fixes:**

| Slide | Context field wired | Effect |
|-------|-------------------|--------|
| `new-contact` | `ctx.companyId → payload.companyId` | Contacts created from company-detail link to that company |
| `new-deal` | `ctx.companyId → payload.companyId` | Deals created from company-detail link to that company |
| `new-task` | `ctx.contactId → payload.contactId`; `ctx.dealId → payload.dealId` | Tasks created from record detail pages are linked to that record |

**Call sites updated:**
- `company-detail.html`: `SS_openSlide('new-contact', { companyId })` and `SS_openSlide('new-deal', { companyId, company: COMPANY.name })`
- `contact-detail.html`: `SS_openSlide('new-task', { contactId })`

---

### Phase 26 — Activity Context Linkage + Deal Tasks Tab

**Files:** `assets/chrome.js`, `deal-detail.html`, `contact-detail.html`

**Activity slide fix:**
- `new-activity` slide changed from `() =>` to `(ctx) =>`
- Removed broken "Linked records" free-text input (was never wired to API)
- Added `if (ctx && ctx.contactId) payload.contactId = ctx.contactId` and `ctx.dealId` equivalent
- `deal-detail.html` "Log activity" button now passes `{ dealId }`
- `contact-detail.html` "Log activity" button now passes `{ contactId }`

**Deal Tasks tab added to `deal-detail.html`:**
- New "Tasks" tab button and `<div data-pane="tasks">` added to tab bar
- `renderTasks()` reads `DEAL.tasks` (loaded by `GET /deals/:id`) and renders checkbox list
- `completeDealTask(id, cb)` calls `SS_API.Tasks.update(id, { completed })` and updates row visual state
- `window.SS_loadTasks` hook refreshes `DEAL.tasks` via `GET /tasks?dealId=` and re-renders
- Boot updated to `loadDeal().then(() => { loadContacts(); renderTasks(); })`

---

### Phase 27 — Tasks API Contact/Deal Includes

**Files:** `smartsense-backend/src/routes/tasks.ts`, `contact-detail.html`

**Issues found and fixed:**

| Issue | Fix |
|-------|-----|
| Task-detail slide shows "Contact" as link label — `ctx.contact` always undefined because `GET /tasks` returned only flat `contactId` | Added `contact: { select: { id, firstName, lastName } }` and `deal: { select: { id, name } }` to tasks findMany include |
| contact-detail task checkboxes had no `onchange` handler — checking was purely visual | Added `onchange="completeContactTask(id, this)"` to each rendered checkbox; added `completeContactTask()` function matching deal-detail pattern |

---

### Phase 28 — Company-Detail Activity Scoping

**Files:** `company-detail.html`

**Issues found and fixed:**

| Issue | Fix |
|-------|-----|
| Timeline tab showed ALL workspace activities — `loadActivities()` fetched with no filter | Build `contactIds` Set from `_companyContacts`; filter activities to those with `contactId` in that set |
| `loadActivities()` ran in parallel with `loadContacts()` — `_companyContacts` was empty at that point | Moved `loadActivities()` into `loadContacts().then()` chain alongside `loadNotes()` |
| Timeline displayed `a.createdAt` (record insertion date) instead of `a.occurredAt` (event date) | Changed sort and display to use `a.occurredAt \|\| a.createdAt` throughout |
| "Activities (30d)" KPI counted by `createdAt` | Changed to use `occurredAt \|\| createdAt` for 30-day window calculation |

---

### Phase 29 — occurredAt Required Field Fix

**Files:** `deal-detail.html`, `company-detail.html`, `contact-detail.html`

**Critical bug:** All three `openAddNote()` functions called `SS_API.Activities.create()` without `occurredAt`. The backend Zod schema declares `occurredAt: z.string()` as required (non-optional) — every "Add note" action was returning a **400 validation error**.

**Fix:** Added `occurredAt: new Date().toISOString()` to all three `Activities.create()` call sites.

**Also fixed in `deal-detail.html`:** `loadActivities()` was sorting and displaying activities using `a.createdAt` instead of `a.occurredAt || a.createdAt`, causing the timeline to show incorrect dates for retroactively-logged activities.

---

### Phase 30 — Sidebar User Name + Activity Sort Fix

**Files:** `assets/chrome.js`, `activities.html`

**Issues fixed:**

| Location | Bug | Fix |
|----------|-----|-----|
| `chrome.js` sidebar footer | Always showed hardcoded "Mayur S." / "Workspace Admin" regardless of logged-in user | Read `ss_user` from localStorage; compute initials and name dynamically; show role label from `ss_role` |
| `chrome.js` user-profile slide | `var name = (u.firstName + u.lastName)` — User model has a single `name` field, so the slide always showed "—" | Changed to `u.name \|\| (u.firstName + u.lastName)` to prefer the `name` field |
| `activities.html` | `_allActs` assigned directly from API response with no sort — list displayed in arbitrary server order | Added descending sort by `occurredAt \|\| createdAt` after fetch |

---

### Phase 31 — Tasks "Linked to" Column + Group-by-Deal Fix + Contacts Owner

**Files:** `tasks.html`, `contacts.html`

| Location | Bug | Fix |
|----------|-----|-----|
| `tasks.html` table | No "Linked to" column — Phase 27 added `contact`/`deal` includes to `GET /tasks` but the table never displayed them | Added 6th column; renders `t.deal.name` or `t.contact.firstName + lastName`; stamps `data-deal` attribute on each row |
| `tasks.html` group-by-deal | Scanned task title text for hardcoded fake company keywords (`["Acme","Northwind",...]`) — every real task always landed in "No deal" | Now reads `data-deal` attribute set at render time from the real `t.deal.name`; deals sorted alphabetically, "No deal" last |
| `tasks.html` colspan | Loading/error rows and group headers used `colspan='5'` after adding a 6th column | Updated all to `colspan='6'` |
| `contacts.html` owner column | Hardcoded `"—"` — never read from API | Changed to `c.owner ? c.owner.name : "—"`; forward-compatible when backend adds the Prisma owner relation |

---

### Phase 32 — Contacts KPI Cards Dynamic Update

**Files:** `contacts.html`

**Issue:** Four KPI cards showed hardcoded fake numbers (1,847 / 23 / 1,612 / 1,604) that never changed regardless of real data.

**Fix:** Added `id` attributes to the KPI value and percentage-delta elements. After `loadContacts()` populates `_allContacts`, computed live values:
- **Total contacts** — `_allContacts.length`
- **New this week** — contacts with `createdAt >= last Monday`
- **With email** — contacts where `c.email` is truthy
- **Linked to company** — contacts where `c.companyId` is truthy
- Percentage deltas recalculated from actual counts

---

### Phase 33 — Filter Focus Guard Fix + Phase 1 Completion Audit

**Files:** `contacts.html`

**Fix:** `applyFilter()` in `contacts.html` called `txtInput.focus()` unconditionally when value was empty — even for fields whose value comes from a `<select>` (`source`, `company`, `email`, `linked`). Updated to route focus to the correct input element based on the active field.

**KPI audit (R2):** Audited `companies.html`, `deals.html`, and `tasks.html` — all three already compute their KPI cards dynamically from live API data. No changes needed. `contacts.html` (fixed in Phase 32) was the only page with hardcoded numbers.

---

### Deploy — 18 Jun 2026

Both Railway repos pushed after completing all Phase 1 frontend cleanup (Phases 27–33):

| Repo | Commits pushed | Key changes |
|------|---------------|-------------|
| `smartSenseCRM-frontend` | 11 commits (`a4651b0` → `b05a520`) | Phases 27–32 frontend fixes + R1 focus guard |
| `smartsenseCRM` (backend) | 1 commit (`bcbcbab` → `d1cd594`) | `GET /tasks` now includes nested `contact` and `deal` objects |

**Frontend URL:** `https://smartsensecrm-frontend-production.up.railway.app`  
**Backend URL:** `https://smartsensecrm-production.up.railway.app`

---

## Phase 1 — Complete

All Phase 1 frontend bugs resolved and deployed on 18 Jun 2026.

---

## Phase 2

### P2-1 — Tasks "Linked to" Dropdown (Dynamic)

**Files:** `assets/chrome.js`

**Issue:** new-task slide "Linked to" dropdown was populated with five hardcoded fake deals and four fake contacts. The dropdown value was never read by `onSave` — only `ctx.contactId`/`ctx.dealId` (set when opened from a detail page) were used.

**Fix:**
- Added `afterShow` callback support to `openSlide()` so slides can run async init code after the panel is in the DOM
- On slide open, fetches real open deals and contacts in parallel via `Promise.all`; populates `<optgroup>` sections dynamically
- Pre-selects the correct option when opened from a contact or deal detail page (`ctx.contactId` / `ctx.dealId`)
- `onSave` now parses the `deal:<id>` / `contact:<id>` prefix from the dropdown selection and sets `payload.dealId` or `payload.contactId` accordingly

---

### P2-2 — Contact → Owner Relation (Schema Migration)

**Files:** `prisma/schema.prisma`, `prisma/migrations/`, `src/routes/contacts.ts`

**Issue:** `Contact` model had `ownerId String` as a bare foreign key with no Prisma `owner` relation defined. `GET /contacts` could not include owner data; the Owner column always showed "—".

**Migration:** `20260618063300_add_contact_owner_relation_and_activity_companyid`

**Changes:**
- `Contact`: added `owner User @relation("ContactOwner", fields: [ownerId], references: [id])`
- `User`: added `ownedContacts Contact[] @relation("ContactOwner")` back-relation
- `GET /contacts`: now includes `owner { id, name }` in every response

---

### P2-3 — Activity companyId (Schema Migration + Backend + Frontend)

**Files:** `prisma/schema.prisma`, `prisma/migrations/`, `src/routes/activities.ts`, `company-detail.html`

**Issue:** `Activity` model had no `companyId` field. Notes added via company-detail were linked to the first contact in the company only — multi-contact companies missed notes, and the activity timeline used a manual client-side filter over all workspace activities rather than a server-side scope.

**Migration:** `20260618063300_add_contact_owner_relation_and_activity_companyid` (batched with P2-2)

**Changes:**
- `Activity`: added `companyId String?` and `company Company? @relation(...)`
- `Company`: added `activities Activity[]` back-relation
- `GET /activities`: added `companyId` query filter; response now includes `company { id, name }`
- `POST /activities`: added `companyId` to Zod schema and JSON schema body
- `company-detail.html`:
  - `loadActivities()` now uses `SS_API.Activities.list({ companyId })` directly — no more manual contactId filtering
  - `loadNotes()` now uses `SS_API.Activities.list({ type: "note", companyId })` directly
  - `openAddNote()` now sets `companyId` on the payload instead of falling back to `_companyContacts[0].id`
  - All five loaders (`loadCompany`, `loadContacts`, `loadNotes`, `loadActivities`, `loadDeals`) now run in parallel on boot

---

### P2-4 — Settings Pages Wired to Real API

**Files:** `src/routes/workspace.ts` (new), `src/routes/users.ts` (new), `src/server.ts`, `assets/api.js`, `settings-workspace.html`, `settings-roles.html`

**Scope:** Three of five deferred settings pages wired to live data. `settings-billing.html` and `settings-authentication.html` skipped — require Stripe and SSO/SCIM integrations respectively.

| Page | Before | After |
|------|--------|-------|
| `settings-audit-log.html` | Already live (verified) | No changes needed — `GET /audit-logs` returns correct shape |
| `settings-workspace.html` | Read-only localStorage; save wrote only to localStorage | Reads from `GET /workspace`; `PATCH /workspace` persists to DB with slug-conflict check + audit log entry |
| `settings-roles.html` | 5 hardcoded role cards with fake user counts (12/3/2/2/0) | Fetches `GET /users`, counts per role enum value, renders cards with real counts |

**New backend routes:**
- `GET /workspace` — returns workspace record with `_count.users`
- `PATCH /workspace` — updates `name`/`slug`; checks slug uniqueness; writes audit log
- `GET /users` — returns all workspace members (`id`, `name`, `email`, `role`, `createdAt`)

**API client additions (`assets/api.js`):**
- `SS_API.Workspace.get()` / `SS_API.Workspace.update(data)`
- `SS_API.Users.list()`

---

### Deploy — 18 Jun 2026 (Phase 2)

| Repo | Commits | Key changes |
|------|---------|-------------|
| `smartsenseCRM` (backend) | `d1cd594` → `25c7f6b` | P2-2+P2-3 migration, contacts/activities routes, workspace + users routes |
| `smartSenseCRM-frontend` | `29f3100` → `79b70d5` | P2-1 dynamic dropdown, P2-3 company-detail, P2-4 settings pages, api.js extensions |

---

## Phase 2 — Complete

All actionable Phase 2 items shipped. Remaining deferred items require external service integrations.

## Deferred to Phase 3 / External Dependencies

| Item | Reason |
|------|--------|
| `settings-billing.html` | Requires Stripe integration (plan data, invoices, payment method) |
| `settings-authentication.html` | Requires SSO/SCIM provider integration (Google Workspace, Azure AD) |
| `settings-pipelines.html` | Requires new `Pipeline` Prisma model + migration + CRUD routes |
| `settings-selling-rules.html` | Requires new `SellingRule` Prisma model + migration + CRUD routes |
| `settings-data-model.html` | Requires schema management API (custom fields, object definitions) |

## Phase 1 — Resolved Items

| Item | Status |
|------|--------|
| Tasks list "Linked to" column | Populated from real `t.deal.name` / `t.contact` objects ✅ |
| Tasks group-by-deal | Groups by real deal name via `data-deal` attribute ✅ |
| Contacts KPI cards | Computed from real `_allContacts` data ✅ |
| Contacts owner column | Reads `c.owner.name` (forward-compatible) ✅ |
| Contacts filter focus guard | Routes focus to correct input by field type ✅ |
| Contact detail — add task from detail | `+ New task` correctly passes contactId; appears in `GET /tasks?contactId=` filter ✅ |
| Deal detail Tasks tab | Fully wired: checkbox complete, `window.SS_loadTasks` refresh hook ✅ |
| All note creation (deal, company, contact) | `occurredAt` now included in all `openAddNote()` calls ✅ |
| Activity timeline dates | All timelines sort and display using `occurredAt \|\| createdAt` ✅ |
| Sidebar user name + role | Reads from localStorage — no longer hardcoded ✅ |
| Activities list sort | Sorted by `occurredAt \|\| createdAt` descending ✅ |

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
