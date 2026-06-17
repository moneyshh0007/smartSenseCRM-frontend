# UI — Deals Specification

## Overview

The deals page (`deals.html`) shows the sales pipeline. It supports both a list view
and a kanban board view. Users can create deals, move them through stages, and mark
them as won or lost.

---

## Requirements

### Requirement: Deals List View
The page SHALL display all visible deals in a list.

- Loads deals via `GET /deals` (role-filtered by the backend).
- Displays: deal name, company, amount, stage, owner, close date.
- Total deal count and total pipeline value are shown.
- Ordered by creation date descending.

#### Scenario: Page loads
- **GIVEN** an authenticated user
- **WHEN** `deals.html` is opened
- **THEN** all deals visible to that role are listed

---

### Requirement: Kanban Board View
A user SHALL be able to switch to a kanban view showing deals grouped by stage.

- Columns correspond to pipeline stages.
- Each card shows: deal name, company, amount, close date.
- Cards can be dragged between columns to change stage (calls `PATCH /deals/:id` with new `stage`).
- The list/kanban toggle persists for the session.

---

### Requirement: Deal Detail Panel
Clicking a deal SHALL open a slide-in detail panel.

- Shows all deal fields, linked company, linked contacts, recent activities, tasks, and notes.
- All fields are editable inline; saving calls `PATCH /deals/:id`.
- "Mark Won" and "Mark Lost" buttons are visible in the panel.

---

### Requirement: Mark Deal Won
A user SHALL be able to mark a deal as Closed Won from the detail panel.

- Clicking "Mark Won" opens a confirmation or minimal form.
- Calls `POST /deals/:id/won`.
- On success: the deal stage updates to "Closed Won" in the UI and a success toast is shown.

#### Scenario: Mark won
- **GIVEN** an open deal in the detail panel
- **WHEN** the user clicks "Mark Won" and confirms
- **THEN** the deal is updated to Closed Won and the panel reflects the change

---

### Requirement: Mark Deal Lost
A user SHALL be able to mark a deal as Closed Lost from the detail panel.

- Clicking "Mark Lost" opens a form requiring a `lostReason`.
- Calls `POST /deals/:id/lost` with the reason.
- On success: the deal stage updates to "Closed Lost" in the UI.

#### Scenario: Mark lost without reason
- **GIVEN** the user clicks Mark Lost but leaves reason blank
- **WHEN** they try to submit
- **THEN** the form shows a validation error and does not call the API

---

### Requirement: Create New Deal
A user SHALL be able to create a new deal.

- Triggered by a "New Deal" button.
- Form fields: name (required), amount (required), stage (required), company, closeDate, pipeline.
- On submit, calls `POST /deals`.
- On success: the deal appears in the list or board.

---

### Requirement: Pipeline Filter
A user SHALL be able to filter the deal list by pipeline and stage.

- Filter controls above the list/board.
- Applies `?pipeline=` and `?stage=` query parameters to the `GET /deals` call.

---

### Requirement: Navigation
The deals page SHALL be accessible from the sidebar under "Records".

- Sidebar entry: label "Deals", link to `deals.html`, shows total deal count.
- Breadcrumb: `Records / Deals`.
