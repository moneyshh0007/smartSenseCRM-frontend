# UI — Contacts Specification

## Overview

The contacts page (`contacts.html`) is the primary list view for all contacts
in the workspace. It supports searching, sorting, and opening a slide-in detail panel.
New contacts can be created via a slide panel form.

---

## Requirements

### Requirement: Contacts List
The page SHALL display all contacts in the workspace in a tabular or card list.

- Loads contacts via `GET /contacts` on page mount.
- Displays: full name, email, phone, company name, title, source, and creation date.
- Contacts are shown in reverse-chronological order (newest first).
- A total count is shown (e.g. "1,847 contacts").

#### Scenario: Page loads with contacts
- **GIVEN** an authenticated user with contacts in their workspace
- **WHEN** `contacts.html` is opened
- **THEN** the full contact list is rendered with all fields visible

---

### Requirement: Contact Search
A user SHALL be able to search contacts by name, email, or company.

- The search input filters the visible list in real time (client-side filter or API call).
- Matching is case-insensitive.

#### Scenario: Search by name
- **GIVEN** the user types a name fragment into the search input
- **WHEN** results are filtered
- **THEN** only contacts whose name contains the fragment are shown

---

### Requirement: Contact Detail Panel
Clicking a contact row SHALL open a slide-in panel showing full contact details.

- The panel shows all contact fields, the linked company, and related deals, tasks, and notes.
- The panel opens from the right side and overlays the list (list remains in background).
- The panel can be closed with an ✕ button or by pressing Escape.
- All fields in the panel are editable inline; saving calls `PATCH /contacts/:id`.

#### Scenario: Open contact panel
- **GIVEN** the user clicks on a contact row
- **WHEN** the panel opens
- **THEN** the full contact detail is shown including linked records

---

### Requirement: Create New Contact
A user SHALL be able to create a new contact via a slide panel form.

- Triggered by a "New Contact" or "+ Add" button.
- The form collects: firstName (required), lastName (required), email, phone, title, linkedinUrl, location, source, companyId.
- On submit, calls `POST /contacts`.
- On success: the new contact is added to the list and the panel closes.
- On error: the error message is shown inside the panel.

#### Scenario: Create contact
- **GIVEN** the user fills in firstName and lastName
- **WHEN** they submit the form
- **THEN** the contact is created and appears at the top of the list

---

### Requirement: Navigation
The contacts page SHALL be accessible from the sidebar under "Records".

- Sidebar entry: label "Contacts", link to `contacts.html`, shows total contact count badge.
- Breadcrumb: `Records / Contacts`.
