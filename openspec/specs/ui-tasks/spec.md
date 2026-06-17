# UI — Tasks Specification

## Overview

The tasks page (`tasks.html`) shows all tasks assigned to the authenticated user
in the workspace. Users can create tasks, filter by status, and mark them complete.
Tasks can also be linked to contacts or deals and opened in a detail panel.

---

## Requirements

### Requirement: Tasks List
The page SHALL display all tasks in the workspace in a list.

- Loads tasks via `GET /tasks` on page mount.
- Displays: title, due date, priority badge, completion status, linked contact or deal.
- Ordered by due date ascending (soonest first), then createdAt descending.
- Overdue tasks (dueAt in the past, not completed) SHOULD be visually highlighted.

#### Scenario: Page loads with tasks
- **GIVEN** an authenticated user with tasks in their workspace
- **WHEN** `tasks.html` is opened
- **THEN** all tasks are listed with their due dates, priorities, and linked records

---

### Requirement: Filter by Completion Status
A user SHALL be able to filter tasks by completion status.

- Filter toggle: "All", "To do", "Completed".
- Applies `?completed=true` or `?completed=false` to the API call.
- Default view shows incomplete tasks.

#### Scenario: View completed tasks
- **GIVEN** the user selects the "Completed" filter
- **WHEN** the list reloads
- **THEN** only completed tasks are shown

---

### Requirement: Task Detail Panel
Clicking a task row SHALL open a slide-in detail panel.

- Shows all task fields: title, dueAt, priority, completed, completedAt, linked contact, linked deal, notes.
- All fields are editable inline.
- A prominent "Mark complete" button marks the task done (calls `PATCH /tasks/:id` with `{ completed: true }`).
- If the task is already complete, shows "Completed on [date]" and a "Reopen" option.
- Linked contact and deal names are clickable and navigate to their respective records.

#### Scenario: Mark task complete
- **GIVEN** an incomplete task in the detail panel
- **WHEN** the user clicks "Mark complete"
- **THEN** the task is updated to completed, `completedAt` is set, and the row updates in the list

---

### Requirement: Create New Task
A user SHALL be able to create a new task from the tasks page.

- Triggered by a "New Task" button in the top bar.
- Opens a slide panel form with: title (required), dueAt, priority, contactId, dealId.
- On submit, calls `POST /tasks`.
- On success: the new task appears in the list (if it matches the current filter).

#### Scenario: Create task linked to a deal
- **GIVEN** the user fills in title and selects a deal
- **WHEN** they submit the form
- **THEN** the task is created and the deal name appears as a link in the task row

---

### Requirement: Navigation
The tasks page SHALL be accessible from the sidebar under "Records".

- Sidebar entry: label "Tasks", link to `tasks.html`, shows incomplete task count badge.
- Breadcrumb: `Records / Tasks`.
