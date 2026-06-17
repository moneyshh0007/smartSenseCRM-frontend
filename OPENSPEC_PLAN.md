# OpenSpec Implementation Plan — SmartSense CRM

> **OpenSpec** (`@fission-ai/openspec`) is a spec-driven development framework.
> Before any code is written, you and the AI agree on a written spec — what to build, why, and how.
> The code follows the spec, not the other way around.

---

## Phase 1 — Installation & Setup

**Goal:** Get OpenSpec installed and wired into both repos.

### Steps

1. **Install the CLI globally**
   ```bash
   npm install -g @fission-ai/openspec@latest
   ```

2. **Initialize OpenSpec in the frontend repo**
   ```bash
   cd SmartSense_CRM_Phase1_Prototype
   openspec init
   ```

3. **Initialize OpenSpec in the backend repo**
   ```bash
   cd smartsense-backend
   openspec init
   ```

4. **Folder structure created in each repo**
   ```
   openspec/
   ├── config.yaml       ← project name, tech stack, conventions
   ├── specs/            ← source of truth (what the system does today)
   ├── changes/          ← active in-progress features
   │   └── archive/      ← completed features
   └── AGENTS.md         ← instructions to Claude on how to work in this project
   ```

5. **Edit `AGENTS.md` in both repos** — tell Claude your stack, conventions, and rules.
   Examples:
   - *"Always validate request bodies with Zod inside route handlers"*
   - *"All backend routes must have plain JSON Schema in their Fastify schema option"*
   - *"Frontend is static HTML + vanilla JS — no frameworks"*

### Deliverable
OpenSpec is installed, both repos have the folder structure, and Claude knows the project conventions through `AGENTS.md`.

---

## Phase 2 — Baseline Specs (Document What Already Exists)

**Goal:** Write source-of-truth specs for everything already built. This is the "current state" snapshot before moving to spec-first development.

> This phase runs **once** — it is mostly documentation work, no code changes.

### Backend specs to write (`openspec/specs/`)

| Spec file | Covers |
|---|---|
| `specs/auth/spec.md` | Register, login, JWT, workspace creation |
| `specs/contacts/spec.md` | Contact CRUD, linking to companies and deals |
| `specs/companies/spec.md` | Company CRUD, contact and deal counts |
| `specs/deals/spec.md` | Deal lifecycle, mark won/lost, role-based filtering |
| `specs/tasks/spec.md` | Task CRUD, mark complete, due dates |
| `specs/activities/spec.md` | Activity log, types (call, email, meeting, note) |

### Frontend specs to write

| Spec file | Covers |
|---|---|
| `specs/ui-auth/spec.md` | Login page, register flow |
| `specs/ui-contacts/spec.md` | Contacts list, contact detail, slide panel |
| `specs/ui-deals/spec.md` | Deals list, pipeline view, mark won/lost |
| `specs/ui-email/spec.md` | Email module UI, connect inbox flow |
| `specs/ui-tasks/spec.md` | Tasks list, task detail panel |

### How to generate baseline specs

Use `/opsx:propose` with a prompt like:
```
/opsx:propose "write baseline spec for the existing auth system"
```
Claude reads the current code and generates the spec. You review and approve before it becomes the source of truth.

### Deliverable
Every existing feature is documented as a spec. This is now the project's single source of truth.

---

## Phase 3 — First Real OpenSpec Feature: Email OAuth

**Goal:** Use the full `/opsx:propose → /opsx:apply → /opsx:archive` workflow for the first real new feature — Gmail and Outlook OAuth integration for the Email module.

> This is the ideal first spec-driven feature because it touches **both repos** (backend OAuth endpoints + frontend redirect handling) and is complex enough to benefit from upfront spec clarity.

### Workflow

**Step 1 — Propose**
```
/opsx:propose "Implement Gmail and Outlook OAuth for the Email module"
```
Claude generates:
- `proposal.md` — why, scope, what is in and out of this change
- `design.md` — OAuth 2.0 flow design, token storage strategy, API route design
- `tasks.md` — exact checklist: create DB model, write backend routes, set up Google Cloud credentials, wire frontend
- `specs/email-oauth/` — delta spec for the new email OAuth requirements

**Step 2 — Review**

Read the proposal and design. If anything looks wrong — for example *"I want refresh tokens stored in the database, not in localStorage"* — edit the spec **before** any code is written. Course-correct on paper, not in code.

**Step 3 — Apply**
```
/opsx:apply
```
Claude reads `tasks.md` and implements each item in order, checking off tasks as it goes.

**Step 4 — Verify**
```
/opsx:verify
```
Claude checks that the implementation matches the spec and flags any gaps.

**Step 5 — Archive**
```
/opsx:archive
```
The change moves to `archive/`, the delta spec merges into `specs/email/spec.md`, and the feature is permanently documented.

### Deliverable
Email OAuth fully implemented and documented. The team has completed one full OpenSpec cycle and knows the workflow end to end.

---

## Phase 4 — All New Features via OpenSpec

**Goal:** From this point forward, every new feature starts with a spec, not with code.

### Upcoming CRM features that will use this workflow

| Feature | Complexity |
|---|---|
| LinkedIn Capture (browser extension / import) | High |
| CSV Contact Import | Medium |
| Email → Contact/Deal auto-linking | Medium |
| Pipeline customization (stages, probabilities) | Medium |
| Reporting and analytics dashboard | High |
| User roles and permissions refinement | Medium |
| Notifications and reminders | Low |

For each:
```
/opsx:propose → review → /opsx:apply → /opsx:verify → /opsx:archive
```

### Team rule
No one writes code for a new feature without a reviewed and approved spec in `openspec/changes/`. Pull requests without a corresponding spec folder get flagged in code review.

### Deliverable
Spec-first is now the team's default way of working.

---

## Phase 5 — Governance & Automation

**Goal:** Make spec compliance automatic and scalable as the team and codebase grow.

### Steps

1. **Add spec validation to CI** — on every pull request, run `openspec verify` to check that the implementation matches the specs
2. **Spec review as part of PR review** — the spec is reviewed and approved before the code PR is opened
3. **Keep `AGENTS.md` up to date** — as conventions evolve (new patterns, new libraries, new rules), update `AGENTS.md` so Claude always works to the latest standards
4. **Use `/opsx:explore`** before large architectural decisions — explore options as a written spec before committing to an approach
5. **Quarterly spec audit** — run `/opsx:verify` across all main specs to catch drift between the spec and the actual codebase

### Deliverable
Specs are automatically validated in CI. The project always has an accurate written description of what it does and why.

---

## Summary

| Phase | When | Effort |
|---|---|---|
| Phase 1 — Installation & Setup | Now | 1–2 hours: install CLI, init both repos, write AGENTS.md |
| Phase 2 — Baseline Specs | Next | ~1 spec per day, reading existing code |
| Phase 3 — Email OAuth (first spec-driven feature) | After Phase 2 | Full feature cycle, learning the workflow hands-on |
| Phase 4 — All New Features via OpenSpec | Ongoing | The new default workflow, no extra overhead |
| Phase 5 — Governance & Automation | After 2–3 features | CI wiring, team review process |

---

## Quick Reference — OpenSpec Commands

| Command | What it does |
|---|---|
| `/opsx:propose` | Creates a change folder with proposal, design, tasks, and delta specs |
| `/opsx:apply` | Implements the tasks in the change proposal |
| `/opsx:verify` | Validates that the implementation matches the spec |
| `/opsx:archive` | Finalises the change, merges delta specs into main specs |
| `/opsx:explore` | Explores an idea before committing to a full change |
| `/opsx:continue` | Builds planning artifacts one at a time (incremental) |
| `/opsx:ff` | Fast-forward: generates all planning artifacts at once |
| `/opsx:sync` | Merges delta specs into main specs manually |
| `/opsx:onboard` | Interactive tutorial using your actual codebase |

---

*Generated for SmartSense CRM Phase 1 — June 2026*
