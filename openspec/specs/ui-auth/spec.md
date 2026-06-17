# UI — Auth Specification

## Overview

The authentication page (`index.html`) is the entry point to SmartSense CRM.
It handles two flows: logging in to an existing workspace, and registering a new one.
Unauthenticated users are redirected here from all other pages.

---

## Requirements

### Requirement: Login Flow
A returning user SHALL be able to log in with email and password.

- The login form collects `email` and `password`.
- On submit, calls `POST /auth/login` via the API client.
- On success: stores the JWT in `localStorage` as `ss_token`, stores user info, then redirects to `my-day.html`.
- On failure (401): displays an inline error message — does not clear the form.
- Validation errors (empty fields) are shown before the API call is made.

#### Scenario: Successful login
- **GIVEN** a user enters a valid email and correct password
- **WHEN** they submit the login form
- **THEN** they are redirected to `my-day.html` and the session is active

#### Scenario: Wrong credentials
- **GIVEN** a user enters an incorrect password
- **WHEN** they submit the login form
- **THEN** an error message is shown inline; the user stays on the login page

---

### Requirement: Register Flow
A new user SHALL be able to register a workspace and become its admin.

- The register form collects: `workspaceName`, `slug`, `region`, `name`, `email`, `password`.
- On submit, calls `POST /auth/register` via the API client.
- On success: stores the JWT, then redirects to `my-day.html`.
- On failure (409 duplicate slug or email): shows the specific error inline.
- The `slug` field SHOULD be auto-populated from `workspaceName` (lowercased, spaces replaced with hyphens).

#### Scenario: Successful registration
- **GIVEN** a new user fills all required fields with valid data
- **WHEN** they submit the register form
- **THEN** their workspace is created, they are logged in, and redirected to `my-day.html`

---

### Requirement: Auth Guard
Every page except `index.html` MUST redirect unauthenticated users to `index.html`.

- Checked at the top of every page script: `if (!SS_API.Auth.isLoggedIn()) window.location.href = "index.html";`
- `isLoggedIn()` checks for a valid `ss_token` in `localStorage`.

---

### Requirement: Social Login Placeholders
The login page MAY show "Continue with Google" and "Continue with Microsoft" buttons.

- These are currently non-functional UI placeholders.
- They SHALL NOT be wired to any OAuth flow until the backend OAuth feature is implemented.
