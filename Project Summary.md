# Project Summary — SmartSense CRM Phase 1 Prototype

**Document Date:** 29 May 2026  
**Status:** Phase 1 Complete — Ready for User Testing  
**Tagline:** "A CRM that writes itself"

---

## 1. Project Overview

SmartSense CRM Phase 1 is a high-fidelity static prototype of a B2B Customer Relationship Management platform built for enterprise sales teams. The prototype demonstrates the full UI, navigation, role-based access, and core CRM workflows across 28 HTML pages — without a backend or database. It is intended for stakeholder demonstration, user testing, and as a blueprint for the production build.

The product is designed with compliance-first principles, supporting SOC2, GDPR, and India DPDP requirements out of the box, with user-selectable data residency at workspace creation.

---

## 2. Tech Stack

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| Markup      | HTML5 (28 standalone pages)                     |
| Styles      | CSS3 — custom design system (1,107 lines)       |
| Fonts       | IBM Plex Sans, IBM Plex Mono, Fraunces (serif)  |
| Logic       | Vanilla JavaScript — `chrome.js` (1,654 lines)  |
| Backend     | None (static prototype)                         |
| Database    | None (hardcoded sample data)                    |
| Persistence | `localStorage` (role switcher, settings state)  |

---

## 3. Project Structure

```
SmartSense_CRM_Phase1_Prototype/
├── assets/
│   ├── chrome.js            # Shared UI chrome + interaction layer
│   └── styles.css           # Global design system stylesheet
├── index.html               # Sign-in / auth page
├── my-day.html              # Dashboard / homepage
├── contacts.html            # Contacts list (1,847 records)
├── contact-detail.html      # Single contact view
├── companies.html           # Companies list (412 records)
├── company-detail.html      # Single company view
├── deals.html               # Deals — Kanban board view
├── deals-table.html         # Deals — Table view
├── deals-table-junior.html  # Deals — Junior Rep restricted view
├── deals-forecast.html      # Forecast dashboard
├── deal-detail.html         # Single deal view
├── activities.html          # Activity feed
├── tasks.html               # Task management
├── dedup.html               # Duplicate detection & merge
├── import-upload.html       # CSV import — Step 1: Upload
├── import.html              # CSV import — Step 2: Column mapping
├── import-review.html       # CSV import — Step 3: Review
├── import-progress.html     # CSV import — Step 4: Progress
├── chrome-extension.html    # LinkedIn Capture extension simulator
├── settings.html            # Admin settings hub
├── settings-workspace.html  # Workspace & data residency
├── settings-billing.html    # Billing & seat management
├── settings-authentication.html  # SSO / SCIM / password auth
├── settings-roles.html      # Role & permission definitions
├── settings-audit-log.html  # Immutable audit trail
├── settings-data-model.html # Data schema editor
├── settings-pipelines.html  # Pipeline & stage configuration
├── settings-selling-rules.html   # Selling rules engine
└── AUDIT.md                 # Gap analysis & fix audit log
```

---

## 4. Core Modules & Features

### 4.1 Contacts (M1)
- **1,847 records** with fields: Name, Email, Phone, Title, Company, Location, LinkedIn URL, Tags, Owner, Source
- Activity timeline per contact (meetings, emails, calls, notes)
- Tabbed detail view: Timeline / Emails / Notes / Tasks / Files
- Auto-sync from Gmail & Calendar (UI-simulated)
- LinkedIn enrichment via Chrome extension
- Bulk CSV import & fuzzy deduplication

### 4.2 Companies (M1)
- **412 records** with fields: Name, Domain, Industry, Size, Open Deals, Pipeline Value, Owner
- Auto-creation from email domains
- Related contacts (many-to-many)
- Pipeline value roll-up
- Bulk merge for deduplication

### 4.3 Deals (M2)
- **47 deals** across 3 pipelines: Direct Sales, Channel Partners, Expansion
- **3 views:**
  - Kanban board (6 stage columns)
  - Table view (sortable, filterable, bulk actions)
  - Junior Rep variant (amounts restricted/hidden)
- **Forecast dashboard:** Commit / Best Case / Pipeline analysis with won/lost reasons
- Stage-gate validation (required fields per stage before progression)
- Rotting deal detection (21+ days without activity in Qualified / Proposal / Negotiation)
- Mark Won flow with win reason capture and CS notification
- Competitive win/loss analysis

### 4.4 Activities (M3)
- Types: Meetings, Emails, Calls, Notes
- Auto-logged from Gmail & Calendar (simulated); manual entry supported
- Linked to contacts, companies, and deals
- Email open/not-opened tracking
- @mentions in notes

### 4.5 Tasks (M3)
- Fields: Title, Due date/time, Priority, Owner, Linked record
- Task completion with checkbox (strike-through + toast confirmation)
- Task creation from notes using `/task` syntax
- Grouping by deal or by owner
- Overdue indicator

---

## 5. Data Operations

### 5.1 CSV Import Wizard
- **4-step flow:** Upload → Map Columns → Review → Import
- AI-suggested column mapping with confidence scores (62–99%)
- Preview: valid rows, duplicate detection, error log
- Batch processing: ~4,823 rows in ~2 minutes
- Supports: Person, Company, Deal, Task, and custom object imports

### 5.2 Duplicate Detection & Merge
- Fuzzy matching on Name + Email + Phone
- Confidence scoring (91–96%)
- **47 duplicate clusters detected** (~2.5% of records)
- Bulk-merge with 30-day undo
- All merge operations audit-logged

### 5.3 LinkedIn Capture (Chrome Extension Simulator)
- Profile scraping UI
- Existing contact detection with diff preview
- New contact creation and record update flows

---

## 6. Smart Filters

- Pre-saved filters: "My Open Pipeline", "New This Week", "Stalled Deals"
- Custom filter builder: Field + Operator + Value
- Chip-based filter UI with clear-filters CTA
- URL-based filter routing (`?filter=stalled`)

---

## 7. Roles & Access Control

| Role | Users | Access Level |
|---|---|---|
| Workspace Admin | 2 | Full access to all objects, settings, billing |
| RevOps Lead | 2 | Schema, pipelines, selling rules |
| Sales Manager | 3 | Read all team data, forecast, reports |
| Sales Rep | 12 | Own records + related activities |
| Junior Rep | — | Restricted amounts, limited object access |

**Access control levels:**
- **Object-level:** Read / Create / Update / Delete per role
- **Record-level:** Own / All / Filtered ownership rules
- **Field-level:** Show / Hide / Restrict specific fields per role (e.g., amounts hidden for Junior Rep)

---

## 8. Admin & Settings

### 8.1 Data Model Editor
- 5 objects: Person, Company, Deal, Task, Note (47 total fields)
- Field types: Text, Currency, Date, Single/Multi-select, Reference, Formula, Lookup
- Schema versioning (v1 → v2 → v3) with history slide-over and rollback

### 8.2 Pipeline & Stage Configuration
- 3 pipelines, 14 total stages
- Probability defaults per stage (10% Discovery → 100% Closed Won)
- Custom stage creation, reordering, and role-based visibility controls

### 8.3 Selling Rules Engine
- 3 active rules
- **Triggers:** No activity for X days, stage move, field change, daily schedule
- **Actions:** Flag deal, Slack notification, create task, send email
- Soft enforcement (visual flag only — never blocks reps)
- Runs nightly at 02:00; compliance tracked per rep

### 8.4 Authentication
- Options: Password, Google OAuth, Microsoft OAuth, SAML SSO
- SCIM toggle for user provisioning
- Admins always retain password fallback even when SSO is enabled

### 8.5 Audit Log
- Immutable, append-only log — **142,890 entries**
- 7-year retention
- Drill-down slide-over with full metadata per entry

### 8.6 Billing
- 38 of 40 seats used
- Stripe integration
- Pro-rated seat addition calculator
- Seat cap behaviour: Auto-purchase / Queue / Block

### 8.7 Data Residency
- Options: US (us-east-1), EU (eu-west-1), India (ap-south-1)
- Selected once at workspace creation; compliant with SOC2, GDPR, DPDP

---

## 9. UX Patterns & Interaction System

| Pattern | Description |
|---|---|
| Slide-over forms | 15+ entity types (contact, deal, task, rule, field, etc.) |
| Toast notifications | Stack-managed, auto-dismiss (3.5s), with optional actions |
| Confirmation modals | Destructive actions: bulk merge, SSO enable, workspace delete |
| Bulk action toolbar | Sticky toolbar on list pages when checkboxes are selected |
| Role switcher | Top-right pill switches live between all 5 roles |
| Smart empty states | Day-zero onboarding hints and CTAs on all major pages |
| Notifications drawer | 5 entries (3 unread) with types and timestamps |
| Help drawer | Keyboard shortcuts reference |
| User chip popover | Profile / Theme / Help / Invite / Sign out |
| KPI grid | 3–4 clickable metrics per page linking to filtered views |

---

## 10. Sample Data Highlights

| Company | Size | Industry | Deal | Amount | Stage |
|---|---|---|---|---|---|
| Acme Corp | 520 | SaaS | Annual License | $48,000 | Proposal |
| Northwind Corp | 1,200 | Logistics | Multi-year | $96,000 | Proposal (**ROTTING** — 27 days) |
| Hooli | 4,200 | SaaS | Multi-year | $28,000 | Negotiation |
| Globex Inc. | 340 | SaaS | — | — | — |

**Q2 FY26 Forecast:**
- Closed Won YTD: $452k (100% of target)
- Commit: $310k (68% of $450k quota)
- Best Case: $214k
- Open Pipeline: $487k
- Omitted / Rotting: $56k–$112k

---

## 11. Validation Summary (Post-Audit)

| Check | Result |
|---|---|
| Broken internal links | 0 across 28 pages |
| HTML div balance | Clean on all 28 pages |
| `chrome.js` syntax | OK (1,654 lines) |
| `styles.css` syntax | OK (1,107 lines) |
| Total buttons wired | 213 (no orphan clicks) |
| Pages with empty states | 8 |
| New JS subsystems | 5 (role-switcher, modals, notifications, help drawer, user-chip popover) |

---

## 12. What's Deferred to Phase 2

| Feature | Notes |
|---|---|
| Real email & calendar sync | Gmail / Outlook two-way integration |
| Real file uploads | S3-backed storage; links only in Phase 1 |
| AI field suggestions | Auto-fill from email content (the "writes itself" promise) |
| Pipeline analytics & reports | Win rate, cycle time, rep leaderboard, funnel charts |
| Multi-currency support | INR / EUR / GBP with conversion rates |
| Bulk email sequences | Templates + multi-step cadences |
| Meeting transcription | Auto-transcribe calls; extract action items |
| Deal health score | ML-based score from activity, stage age, sentiment |
| Custom formula fields | Lookup + formula field evaluation |
| Mobile / PWA | Responsive mobile UI or React Native app |
| Real backend + API | Node.js / Python + PostgreSQL production stack |
| Webhook & Zapier | Trigger external workflows from CRM events |
| Team forecast hierarchy | Manager rolls up rep forecasts |
| Territory & quota management | Region assignment + quota tracking per rep/team |

---

## 13. Recommended Next Features (Phase 2 Priorities)

1. **Real Backend & Database** — Production-ready Node.js/Python API with PostgreSQL; the foundation everything else depends on
2. **Email Integration (live)** — Two-way Gmail/Outlook sync with open/click tracking; highest daily-use value for reps
3. **AI-Powered Suggestions** — Auto-fill stage, close date, next action from email content (delivers the "writes itself" tagline)
4. **Pipeline Analytics** — Win rate by stage, average deal cycle, rep leaderboard — essential for Sales Managers
5. **Meeting Transcription & Summaries** — Auto-log calls and extract action items; reduces manual data entry significantly
6. **Deal Health Score** — ML-based score combining days-in-stage, activity recency, sentiment, and competitor signals

---

*Document prepared by: Claude Code (SmartSense CRM Phase 1 Prototype analysis)*  
*Last updated: 29 May 2026*
