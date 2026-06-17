# UI — Email Specification

## Overview

The email page (`emails.html`) provides an email client embedded inside SmartSense CRM.
It connects to a real Gmail, Outlook, or other inbox via OAuth. Emails are displayed
in a three-column layout (folders → list → detail) and are automatically linked
to contacts and deals.

---

## Requirements

### Requirement: Connect Inbox — Unauthenticated State
When no inbox has been connected, the page SHALL show a "Connect your inbox" screen
instead of the email client.

- The connect screen shows: an email icon, "Connect your inbox" heading, a short description,
  a "Connect inbox →" CTA button, and a security note ("Your emails are encrypted and only visible to you.").
- The Compose button SHALL be hidden in this state.
- Connection state is stored in `localStorage` (`ss_email_connected`, `ss_email_provider`, `ss_email_address`).

#### Scenario: First visit
- **GIVEN** no email inbox has been connected (localStorage is empty)
- **WHEN** the user opens `emails.html`
- **THEN** the connect screen is shown and the email list is hidden

---

### Requirement: Provider Selection Modal
Clicking "Connect inbox →" SHALL open a modal listing supported email providers.

- Supported providers: Gmail, Microsoft Outlook, Yahoo Mail, Other (IMAP/SMTP).
- Each option shows the provider icon (colour-coded), name, and a short hint (e.g. "Google Workspace or personal Gmail").
- Clicking a provider opens the auth consent screen for that provider.
- The modal can be dismissed by clicking the backdrop or the ✕ button.

#### Scenario: Select Gmail
- **GIVEN** the provider modal is open
- **WHEN** the user clicks the Gmail option
- **THEN** the provider modal closes and the Gmail auth consent screen opens

---

### Requirement: Auth Consent Screen
After selecting a provider, the page SHALL show an authorization consent screen.

- Shows the provider icon and "Authorize SmartSense CRM" heading.
- Lists the permissions being requested:
  - Read emails in inbox, sent, and drafts
  - Send emails on behalf of the user
  - Manage labels and organise the inbox
  - Link emails to contacts and deals
- Includes an email input field for the user to enter the account they are connecting.
- Two actions: "Cancel" (returns to provider modal) and "Authorize access →".
- The email field MUST not be empty and MUST contain "@" before the API call is made.

#### Scenario: Authorize with valid email
- **GIVEN** the user has entered a valid email address
- **WHEN** they click "Authorize access →"
- **THEN** the consent modal closes and the connecting spinner appears

#### Scenario: Authorize with empty email
- **GIVEN** the email input is empty
- **WHEN** the user clicks "Authorize access →"
- **THEN** the input is highlighted in red and no API call is made

---

### Requirement: Connecting State
After authorization, a loading modal SHALL indicate that the connection is in progress.

- Shows a spinner, "Connecting to [Provider]…" text, and a subtitle.
- Lasts approximately 1.8 seconds (simulated; will be replaced by real OAuth callback).
- On completion: connection state is persisted to `localStorage`, the email client is shown,
  the connected email address appears in the sidebar, and a success toast is shown.

---

### Requirement: Email Client — Connected State
Once connected, the full email client SHALL be shown.

**Layout:** Three columns — folder sidebar (160px) → email list (380px) → email detail (remaining width).

**Folder sidebar:**
- Connected account badge showing email address and a disconnect (✕) button.
- Compose button.
- Folders: Inbox (with unread count), Starred, Sent, Drafts (with draft count).
- Labels: "Deal emails", "Contact emails".

**Email list pane:**
- Search input to filter emails by sender, subject, or preview text.
- "Mark all read" button.
- Each email row shows: avatar (initials, colour-coded), sender name, subject, preview text,
  timestamp, unread dot, star indicator, and a CRM link badge (linked deal or contact).
- Unread emails are displayed in bold.
- Clicking a row opens the email in the detail pane and marks it as read.

**Email detail pane:**
- Empty state ("Select an email to read") when no email is selected.
- When an email is selected: subject, From/To/Date metadata, body text, and linked CRM record cards.
- Action buttons: Reply, Reply all, Forward, Delete.
- Linked record cards for the associated contact and deal; clicking navigates to that record.

#### Scenario: Select an email
- **GIVEN** the inbox is connected and the user clicks an email row
- **WHEN** the detail pane opens
- **THEN** the email is shown as read, the unread dot disappears, and the inbox unread count decreases

---

### Requirement: Compose
A user SHALL be able to compose a new email.

- Triggered by the Compose button in the folder sidebar.
- Opens a compose panel anchored to the bottom-right corner.
- Fields: To (with contact autocomplete from `GET /contacts`), CC, Subject, Body.
- Actions: Send, Save draft, Discard, Minimise.
- Sending adds the email to the Sent folder (currently client-side only).
- Saving adds the email to the Drafts folder.

---

### Requirement: Disconnect Inbox
A user SHALL be able to disconnect their inbox from the sidebar.

- Clicking the ✕ button next to the connected email address shows a confirmation dialog.
- On confirmation: localStorage is cleared, the connect screen is shown again.
- CRM data (contacts, deals) is NOT affected by disconnecting.

#### Scenario: Disconnect
- **GIVEN** an inbox is connected
- **WHEN** the user clicks ✕ and confirms
- **THEN** the connect screen is shown and localStorage connection keys are removed

---

### Requirement: Navigation
The email page SHALL be accessible from the sidebar under "Records".

- Sidebar entry: label "Email", link to `emails.html`, shows unread email count badge.
- Breadcrumb: `Records / Email`.
