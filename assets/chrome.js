// SmartSense CRM Prototype — shared chrome + interaction layer.
// Adds: sidebar injection, slide-over forms, toast notifications,
// chip removal, and click delegation that maps button text to actions.

(function () {

  // ============================================================
  // 1. NAVIGATION CONFIG
  // ============================================================
  const NAV = [
    { group: "Workspace", items: [
      { id: "my-day", href: "my-day.html", label: "My Day", icon: "◐", count: "3" },
    ]},
    { group: "Records", items: [
      { id: "contacts",  href: "contacts.html",   label: "Contacts",   icon: "○", count: "1,847" },
      { id: "companies", href: "companies.html",  label: "Companies",  icon: "□", count: "412" },
      { id: "deals",     href: "deals.html",      label: "Deals",      icon: "◇", count: "47" },
      { id: "activities",href: "activities.html", label: "Activities", icon: "≡", count: "" },
      { id: "tasks",     href: "tasks.html",      label: "Tasks",      icon: "✓", count: "8" },
    ]},
    { group: "Smart Filters", items: [
      { id: "filter-my-pipeline",   href: "deals.html?filter=my",         label: "My Open Pipeline", icon: "★", count: "12" },
      { id: "filter-new-this-week", href: "contacts.html?filter=new",     label: "New This Week",    icon: "★", count: "47" },
      { id: "filter-stalled",       href: "deals.html?filter=stalled",    label: "Stalled Deals",    icon: "★", count: "4" },
    ]},
    { group: "Tools", items: [
      { id: "import",    href: "import.html",           label: "Import CSV",       icon: "↓", count: "" },
      { id: "dedup",     href: "dedup.html",            label: "Find Duplicates",  icon: "⌖", count: "" },
      { id: "extension", href: "chrome-extension.html", label: "LinkedIn Capture", icon: "in", count: "" },
    ]},
    { group: "Admin", items: [
      { id: "settings", href: "settings.html", label: "Settings", icon: "⚙", count: "" },
    ]},
  ];

  function renderSidebar(activeId) {
    let html = `
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark">SmartSense</div>
          <div class="brand-sub">CRM · Phase 1</div>
        </div>
        <a class="search-trigger" href="javascript:void(0)" data-action="open-search">
          <span>Search anything</span>
          <span class="kbd">⌘K</span>
        </a>
    `;
    for (const group of NAV) {
      html += `<div class="nav-group">`;
      html += `<div class="nav-group-title">${group.group}</div>`;
      for (const item of group.items) {
        const isActive = item.id === activeId ? " active" : "";
        html += `
          <a class="nav-item${isActive}" href="${item.href}">
            <span class="nav-icon">${item.icon}</span>
            <span>${item.label}</span>
            ${item.count ? `<span class="nav-count">${item.count}</span>` : ""}
          </a>
        `;
      }
      html += `</div>`;
    }
    html += `
        <div class="sidebar-footer">
          <div class="user-chip">
            <div class="avatar">MS</div>
            <div>
              <div class="user-name">Mayur S.</div>
              <div class="user-role">Workspace Admin</div>
            </div>
          </div>
        </div>
      </aside>
    `;
    return html;
  }

  // ============================================================
  // 2. TOAST SYSTEM
  // ============================================================
  function ensureToastStack() {
    let stack = document.querySelector(".toast-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "toast-stack";
      document.body.appendChild(stack);
    }
    return stack;
  }
  function toast(msg, opts) {
    opts = opts || {};
    const stack = ensureToastStack();
    const el = document.createElement("div");
    el.className = "toast";
    const sub = opts.sub ? `<div class="toast-sub">${opts.sub}</div>` : "";
    const action = opts.action
      ? `<span class="toast-action" data-toast-action>${opts.action}</span>`
      : "";
    el.innerHTML = `
      <span class="toast-dot"></span>
      <div class="toast-msg">${msg}${sub}</div>
      ${action}
    `;
    stack.appendChild(el);
    requestAnimationFrame(() => el.classList.add("open"));
    const dur = opts.duration || 3500;
    const timer = setTimeout(() => closeToast(el), dur);
    el.addEventListener("click", (e) => {
      if (e.target.hasAttribute("data-toast-action")) {
        clearTimeout(timer);
        if (opts.onAction) opts.onAction();
        closeToast(el);
      }
    });
  }
  function closeToast(el) {
    el.classList.remove("open");
    setTimeout(() => el.remove(), 240);
  }

  // ============================================================
  // 3. SLIDE-OVER SYSTEM
  // ============================================================
  function ensureSlideHost() {
    let backdrop = document.querySelector(".slide-backdrop");
    let panel = document.querySelector(".slide-over");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "slide-backdrop";
      backdrop.addEventListener("click", closeSlide);
      document.body.appendChild(backdrop);
    }
    if (!panel) {
      panel = document.createElement("aside");
      panel.className = "slide-over";
      document.body.appendChild(panel);
    }
    return { backdrop, panel };
  }

  function openSlide({ eyebrow, title, body, primaryLabel, secondaryLabel, onSave, onCancel, note }) {
    const { backdrop, panel } = ensureSlideHost();
    primaryLabel = primaryLabel || "Save";
    secondaryLabel = secondaryLabel || "Cancel";
    panel.innerHTML = `
      <header class="slide-head">
        <div>
          ${eyebrow ? `<div class="slide-eyebrow">${eyebrow}</div>` : ""}
          <h2 class="slide-title">${title}</h2>
        </div>
        <button class="slide-close" data-slide-close aria-label="Close">×</button>
      </header>
      <div class="slide-body">${body}</div>
      <footer class="slide-foot">
        ${note ? `<div class="slide-note">${note}</div>` : ""}
        <button class="btn" data-slide-cancel>${secondaryLabel}</button>
        <button class="btn primary" data-slide-save>${primaryLabel}</button>
      </footer>
    `;
    backdrop.classList.add("open");
    requestAnimationFrame(() => panel.classList.add("open"));
    panel.querySelector("[data-slide-close]").addEventListener("click", closeSlide);
    panel.querySelector("[data-slide-cancel]").addEventListener("click", () => {
      if (onCancel) onCancel();
      closeSlide();
    });
    panel.querySelector("[data-slide-save]").addEventListener("click", () => {
      if (onSave) onSave(panel);
      closeSlide();
    });
    // Wire up any toggles inside the slide
    panel.querySelectorAll("[data-toggle]").forEach(el => {
      el.addEventListener("click", () => el.classList.toggle("on"));
    });
    // Auto-focus first input
    setTimeout(() => {
      const first = panel.querySelector("input:not([type=checkbox]):not([type=radio]), textarea, select");
      if (first) first.focus();
    }, 260);
  }

  function closeSlide() {
    const backdrop = document.querySelector(".slide-backdrop");
    const panel = document.querySelector(".slide-over");
    if (backdrop) backdrop.classList.remove("open");
    if (panel) panel.classList.remove("open");
  }

  // ============================================================
  // 4. FORM TEMPLATES (for "+ New X" slide-overs)
  // ============================================================
  const Forms = {
    "new-contact": () => ({
      eyebrow: "M1 · F1.1 · New Person",
      title: "Add a new contact",
      body: `
        <div class="field-row">
          <div class="field"><label>First name<span class="field-required-marker">*</span></label><input type="text" placeholder="Sarah" /><div class="field-error-text">First name is required</div></div>
          <div class="field"><label>Last name<span class="field-required-marker">*</span></label><input type="text" placeholder="Chen" /></div>
        </div>
        <div class="field"><label>Work email<span class="field-required-marker">*</span></label><input type="email" placeholder="sarah.chen@acme.com" /></div>
        <div class="field-row">
          <div class="field"><label>Title</label><input type="text" placeholder="VP Engineering" /></div>
          <div class="field"><label>Phone</label><input type="text" placeholder="+1 415 555 0117" /></div>
        </div>
        <div class="field"><label>Company</label><input type="text" placeholder="Search or create a company..." value="Acme Corp" /></div>
        <div class="field-row">
          <div class="field"><label>Location</label><input type="text" placeholder="San Francisco, CA" /></div>
          <div class="field"><label>LinkedIn URL</label><input type="text" placeholder="linkedin.com/in/sarahchen" /></div>
        </div>
        <h4>Tags &amp; ownership</h4>
        <div class="field-row">
          <div class="field"><label>Owner</label><select><option>Mayur S.</option><option>Sarah K.</option></select></div>
          <div class="field"><label>Source</label><select><option>Manual</option><option>LinkedIn</option><option>Email sync</option><option>CSV import</option></select></div>
        </div>
        <div class="field"><label>Tags</label><input type="text" placeholder="Comma-separated, e.g. Enterprise, Decision Maker" /></div>
      `,
      primaryLabel: "Create contact",
      note: "Visible to all roles with Person read",
      onSave: () => toast("Contact created", { sub: "Person · linked to Acme Corp" }),
    }),

    "new-company": () => ({
      eyebrow: "M1 · F1.1 · New Company",
      title: "Add a new company",
      body: `
        <div class="field"><label>Company name</label><input type="text" placeholder="Acme Corp" /></div>
        <div class="field"><label>Website / domain</label><input type="text" placeholder="acme.com" /></div>
        <div class="field-row">
          <div class="field"><label>Industry</label>
            <select><option>SaaS</option><option>Fintech</option><option>Logistics</option><option>Healthcare</option><option>Retail</option><option>Other</option></select>
          </div>
          <div class="field"><label>Employees</label>
            <select><option>1–10</option><option>11–50</option><option>51–200</option><option selected>201–500</option><option>500+</option></select>
          </div>
        </div>
        <div class="field"><label>HQ location</label><input type="text" placeholder="San Francisco, US" /></div>
        <h4>Ownership</h4>
        <div class="field"><label>Owner</label><select><option>Mayur S.</option><option>Sarah K.</option></select></div>
        <div class="field"><label>Tags</label><input type="text" placeholder="e.g. Enterprise, Strategic" /></div>
      `,
      primaryLabel: "Create company",
      note: "Auto-enrichment will populate logo + size · F1.4",
      onSave: () => toast("Company created", { sub: "Enrichment queued" }),
    }),

    "new-deal": (ctx) => ({
      eyebrow: "M2 · F2.1 · F2.2 · New Deal",
      title: "Add a new deal",
      body: `
        <div class="field"><label>Deal name<span class="field-required-marker">*</span></label><input type="text" placeholder="Acme — Annual License" /></div>
        <div class="field"><label>Company<span class="field-required-marker">*</span></label><input type="text" value="${ctx && ctx.company ? ctx.company : 'Acme Corp'}" /></div>
        <div class="field-row">
          <div class="field"><label>Pipeline</label>
            <select><option>Direct Sales</option><option>Channel Partner Deals</option><option>Expansion (renewals)</option></select>
          </div>
          <div class="field"><label>Stage</label>
            <select><option selected>Discovery</option><option>Qualified</option><option>Proposal</option><option>Negotiation</option><option>Closed Won</option><option>Closed Lost</option></select>
          </div>
        </div>
        <div class="field-row">
          <div class="field"><label>Amount<span class="field-required-marker">*</span></label><input type="text" placeholder="$48,000" /></div>
          <div class="field"><label>Close date</label><input type="date" /></div>
        </div>
        <h4>Custom fields (F2.3)</h4>
        <div class="field-row">
          <div class="field"><label>Competitor</label>
            <select><option>None</option><option>HubSpot</option><option>Salesforce</option><option>Pipedrive</option></select>
          </div>
          <div class="field"><label>Source</label>
            <select><option>LinkedIn outbound</option><option>Inbound</option><option>Channel</option><option>Referral</option></select>
          </div>
        </div>
        <div class="field"><label>Owner</label><select><option>Mayur S.</option><option>Sarah K.</option></select></div>
        <div class="card" style="background:var(--paper-warm); padding:12px 14px; margin-top:12px;">
          <div class="label">SYSTEM-DERIVED ON CREATE (E2 note)</div>
          <div class="text-muted mt-2" style="font-size: 12px;">
            <strong>Probability:</strong> set from stage default (Discovery = 10%) · editable after create<br/>
            <strong>Forecast category:</strong> defaults to "Pipeline" · rep updates each week<br/>
            <strong>ACV tier:</strong> auto-bucketed from amount (Mid-market &lt; $100k, Enterprise ≥ $100k)
          </div>
        </div>
      `,
      primaryLabel: "Create deal",
      note: "Stage-gate validation: required fields enforced per stage on save (G16). Initial stage defaults to Discovery.",
      onSave: () => toast("Deal created", { sub: "Added to Direct Sales · Discovery" }),
    }),

    "new-task": (ctx) => ({
      eyebrow: "M3 · F3.1 · New Task",
      title: "Add a new task",
      body: `
        <div class="field"><label>Title</label><input type="text" placeholder="Follow up on pricing question" /></div>
        <div class="field-row">
          <div class="field"><label>Due date</label><input type="date" /></div>
          <div class="field"><label>Time</label><input type="text" placeholder="10:00 AM" /></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Priority</label><select><option>High</option><option>Medium</option><option>Low</option></select></div>
          <div class="field"><label>Owner</label><select><option>Mayur S.</option><option>Sarah K.</option></select></div>
        </div>
        <div class="field"><label>Linked to</label><input type="text" value="${ctx && ctx.linkedTo ? ctx.linkedTo : ''}" placeholder="Deal, Contact or Company" /></div>
        <div class="field"><label>Description</label><textarea placeholder="Optional notes"></textarea></div>
        <div class="checkbox-line"><input type="checkbox" /> <span>Set a reminder 15 minutes before due time</span></div>
        <div class="checkbox-line"><input type="checkbox" /> <span>Repeat weekly</span></div>
      `,
      primaryLabel: "Create task",
      note: "Reminder will appear as a browser notification",
      onSave: () => toast("Task created", { sub: "Visible in My Day and Tasks" }),
    }),

    "new-activity": () => ({
      eyebrow: "M3 · F3.2 · Log Activity",
      title: "Log an activity",
      body: `
        <div class="field"><label>Activity type</label>
          <select><option>Meeting</option><option>Call</option><option>Email</option><option>Other</option></select>
        </div>
        <div class="field"><label>Summary</label><input type="text" placeholder="Discovery call with Sarah Chen" /></div>
        <div class="field-row">
          <div class="field"><label>Date</label><input type="date" /></div>
          <div class="field"><label>Duration (min)</label><input type="number" placeholder="45" /></div>
        </div>
        <div class="field"><label>Linked records</label><input type="text" placeholder="Contacts and / or deals" /></div>
        <div class="field"><label>Notes</label><textarea placeholder="What was discussed? Outcomes? Next steps?"></textarea></div>
      `,
      primaryLabel: "Log activity",
      onSave: () => toast("Activity logged", { sub: "Added to timeline" }),
    }),

    "new-pipeline": () => ({
      eyebrow: "M2 · F2.1 · New Pipeline",
      title: "Add a new pipeline",
      body: `
        <div class="field"><label>Pipeline name</label><input type="text" placeholder="Channel Partner Deals" /></div>
        <div class="field"><label>Description</label><input type="text" placeholder="Used for indirect deals through resellers" /></div>
        <h4>Stages (drag to reorder)</h4>
        <div class="field-row">
          <div class="field" style="flex: 3;"><label>Stage name</label><input type="text" value="Identified" /></div>
          <div class="field" style="flex: 1;"><label>Probability</label><input type="text" value="10%" /></div>
        </div>
        <div class="field-row">
          <div class="field" style="flex: 3;"><input type="text" value="Qualified" /></div>
          <div class="field" style="flex: 1;"><input type="text" value="30%" /></div>
        </div>
        <div class="field-row">
          <div class="field" style="flex: 3;"><input type="text" value="Co-sell" /></div>
          <div class="field" style="flex: 1;"><input type="text" value="60%" /></div>
        </div>
        <div class="field-row">
          <div class="field" style="flex: 3;"><input type="text" value="Signed" /></div>
          <div class="field" style="flex: 1;"><input type="text" value="85%" /></div>
        </div>
        <button class="btn sm">+ Add stage</button>
        <h4>Visibility</h4>
        <div class="field"><label>Visible to roles</label>
          <select><option>All roles</option><option>Channel team only</option><option>Custom...</option></select>
        </div>
      `,
      primaryLabel: "Create pipeline",
      note: "RBAC respects visibility · F9.1",
      onSave: () => toast("Pipeline created", { sub: "Visible to assigned roles" }),
    }),

    "new-role": () => ({
      eyebrow: "M9 · F9.1 · New Role",
      title: "Create a new role",
      body: `
        <div class="field"><label>Role name</label><input type="text" placeholder="Junior Rep" /></div>
        <div class="field"><label>Description</label><input type="text" placeholder="Limited access for new hires" /></div>
        <h4>Object permissions</h4>
        <div style="display: grid; grid-template-columns: 1fr 80px 80px 80px 80px; gap: 8px; font-size: 12px; align-items: center;">
          <div></div>
          <div class="label" style="text-align:center;">Read</div>
          <div class="label" style="text-align:center;">Create</div>
          <div class="label" style="text-align:center;">Update</div>
          <div class="label" style="text-align:center;">Delete</div>
          <div>Person</div>
          <div style="text-align:center;"><input type="checkbox" checked /></div>
          <div style="text-align:center;"><input type="checkbox" checked /></div>
          <div style="text-align:center;"><input type="checkbox" checked /></div>
          <div style="text-align:center;"><input type="checkbox" /></div>
          <div>Company</div>
          <div style="text-align:center;"><input type="checkbox" checked /></div>
          <div style="text-align:center;"><input type="checkbox" checked /></div>
          <div style="text-align:center;"><input type="checkbox" checked /></div>
          <div style="text-align:center;"><input type="checkbox" /></div>
          <div>Deal</div>
          <div style="text-align:center;"><input type="checkbox" checked /></div>
          <div style="text-align:center;"><input type="checkbox" checked /></div>
          <div style="text-align:center;"><input type="checkbox" checked /></div>
          <div style="text-align:center;"><input type="checkbox" /></div>
        </div>
        <h4>Record-level filter (optional)</h4>
        <div class="field">
          <label>Restrict to records matching</label>
          <input type="text" placeholder="e.g. amount &lt; $100k" />
          <div class="field-hint">Applies to Deal · users with this role only see matching records</div>
        </div>
      `,
      primaryLabel: "Create role",
      note: "Takes effect on users' next login",
      onSave: () => toast("Role created", { sub: "Assign it from a user's profile" }),
    }),

    "new-rule": () => ({
      eyebrow: "M3 · F3.4 · New Selling Rule",
      title: "Create a selling rule",
      body: `
        <div class="field"><label>Rule name</label><input type="text" placeholder="Every open deal needs activity in 5 days" /></div>
        <h4>When</h4>
        <div class="field"><label>Trigger</label>
          <select>
            <option>Deal has no activity for X days</option>
            <option>Deal moves to a stage</option>
            <option>Deal field changes</option>
            <option>Daily scheduled check</option>
          </select>
        </div>
        <div class="field-row">
          <div class="field"><label>Threshold</label><input type="text" value="5 days" /></div>
          <div class="field"><label>Applies to stages</label><select><option>Proposal+</option><option>Qualified+</option><option>All</option></select></div>
        </div>
        <h4>Then</h4>
        <div class="field"><label>Action</label>
          <select>
            <option>Flag deal with warning indicator</option>
            <option>Send Slack notification to owner's manager</option>
            <option>Create a task for the owner</option>
            <option>Email the owner</option>
          </select>
        </div>
        <div class="checkbox-line"><input type="checkbox" checked /> <span>Track compliance rate per rep</span></div>
      `,
      primaryLabel: "Create rule",
      note: "Soft enforcement — visual flag, never blocks the rep",
      onSave: () => toast("Selling rule created", { sub: "Runs nightly at 02:00" }),
    }),

    "new-object": () => ({
      eyebrow: "M1 · F1.1 · New Object",
      title: "Create a custom object",
      body: `
        <div class="field-row">
          <div class="field" style="flex: 3;"><label>Object name (singular)</label><input type="text" placeholder="Project" /></div>
          <div class="field"><label>Plural</label><input type="text" placeholder="Projects" /></div>
        </div>
        <div class="field"><label>Icon</label>
          <select><option>◆ Diamond</option><option>● Circle</option><option>□ Square</option><option>▲ Triangle</option><option>★ Star</option></select>
        </div>
        <div class="field"><label>Description</label><input type="text" placeholder="Used to model post-sale delivery work" /></div>
        <h4>Starter fields</h4>
        <div class="checkbox-line"><input type="checkbox" checked /> <span>Name (text, required)</span></div>
        <div class="checkbox-line"><input type="checkbox" checked /> <span>Owner (person reference)</span></div>
        <div class="checkbox-line"><input type="checkbox" /> <span>Status (single-select)</span></div>
        <div class="checkbox-line"><input type="checkbox" /> <span>Linked company (reference)</span></div>
        <div class="checkbox-line"><input type="checkbox" /> <span>Created / Updated (system)</span></div>
        <div class="field-hint mt-3">Up to 25 custom objects per workspace.</div>
      `,
      primaryLabel: "Create object",
      note: "Schema will version v3 → v4 · audit-logged",
      onSave: () => toast("Custom object created", { sub: "Add fields next" }),
    }),

    "new-field": () => ({
      eyebrow: "M1 · F1.1 · F2.3 · New Field",
      title: "Add a field to Deal",
      body: `
        <div class="field"><label>Field name</label><input type="text" placeholder="ACV tier" /></div>
        <div class="field"><label>Type</label>
          <select>
            <option>Text</option><option>Number</option><option>Currency</option><option>Date</option>
            <option>Single-select</option><option>Multi-select</option><option>Person reference</option>
            <option>Company reference</option><option>Formula</option><option>URL</option>
          </select>
        </div>
        <div class="field"><label>Default value</label><input type="text" placeholder="(optional)" /></div>
        <div class="checkbox-line"><input type="checkbox" /> <span>Required field</span></div>
        <div class="checkbox-line"><input type="checkbox" /> <span>Required as stage-gate (before moving past...)</span></div>
        <div class="field"><label>API key</label><input type="text" value="acv_tier" /></div>
      `,
      primaryLabel: "Add field",
      note: "Schema will version v3 → v4",
      onSave: () => toast("Field added", { sub: "Materialised view rebuilding" }),
    }),

    "new-filter": () => ({
      eyebrow: "M1 · F1.6 · New Filter",
      title: "Add filter condition",
      body: `
        <div class="field-row">
          <div class="field"><label>Field</label>
            <select><option>Owner</option><option>Created date</option><option>Tags</option><option>Company</option><option>Title</option><option>Stage</option><option>Amount</option></select>
          </div>
          <div class="field"><label>Operator</label>
            <select><option>equals</option><option>contains</option><option>is greater than</option><option>is less than</option><option>is empty</option></select>
          </div>
        </div>
        <div class="field"><label>Value</label><input type="text" placeholder="e.g. me, or last 7 days" /></div>
      `,
      primaryLabel: "Add filter",
      onSave: () => toast("Filter added", { sub: "Result count updated" }),
    }),

    "save-filter": () => ({
      eyebrow: "M1 · F1.6 · Smart Filter",
      title: "Save as smart filter",
      body: `
        <div class="field"><label>Filter name</label><input type="text" placeholder="My Enterprise Pilots" /></div>
        <div class="field"><label>Description</label><input type="text" placeholder="(optional)" /></div>
        <h4>Sharing</h4>
        <div class="checkbox-line"><input type="checkbox" checked /> <span>Private to me</span></div>
        <div class="checkbox-line"><input type="checkbox" /> <span>Pin to sidebar</span></div>
        <div class="checkbox-line"><input type="checkbox" /> <span>Share with my team</span></div>
        <div class="field-hint mt-3">Shared filters respect RBAC — different users see different results based on permissions.</div>
      `,
      primaryLabel: "Save filter",
      onSave: () => toast("Smart filter saved", { sub: "Pinned to sidebar" }),
    }),

    "add-seats": () => ({
      eyebrow: "M9 · F9.4 · Billing",
      title: "Add seats",
      body: `
        <div class="field"><label>Seats to add</label><input type="number" value="5" /></div>
        <h4>Pro-ration preview</h4>
        <div class="card" style="background: var(--paper-warm);">
          <dl class="kv-grid">
            <dt>Current plan</dt><dd>Business — $49 / seat / month</dd>
            <dt>Today's charge</dt><dd class="text-mono">$122.50 (pro-rated 6 days)</dd>
            <dt>Next invoice</dt><dd class="text-mono">$2,205.00 (45 seats)</dd>
            <dt>Annual run rate</dt><dd class="text-mono">$26,460</dd>
          </dl>
        </div>
        <div class="field-hint mt-3">Charged to VISA •••• 4242. Receipt emailed to billing@smartsense.io.</div>
      `,
      primaryLabel: "Confirm and charge",
      note: "Stripe will charge immediately",
      onSave: () => toast("5 seats added", { sub: "Receipt sent · invite users now" }),
    }),

    "stage-change": () => ({
      eyebrow: "M2 · F2.2 · Stage transition",
      title: "Move deal to a new stage",
      body: `
        <div class="field"><label>New stage</label>
          <select>
            <option>Discovery</option>
            <option>Qualified</option>
            <option selected>Proposal</option>
            <option>Negotiation</option>
            <option>Closed Won</option>
            <option>Closed Lost</option>
          </select>
        </div>
        <div class="field"><label>Notes (optional)</label><textarea placeholder="Why is this deal moving stages?"></textarea></div>
        <div class="card mt-3" style="background: var(--paper-warm);">
          <div class="label">Stage-gate check (F2.3)</div>
          <div class="mt-2" style="font-size: 12px;">
            ✓ Competitor: HubSpot · set 22 May<br/>
            ✓ Source: LinkedIn outbound<br/>
            ✓ Amount: $48,000
          </div>
        </div>
      `,
      primaryLabel: "Move stage",
      note: "Days-in-stage will reset · audit-logged",
      onSave: () => toast("Stage updated", { sub: "Activity logged on timeline" }),
    }),

    "mark-won": () => ({
      eyebrow: "M2 · F2.6 · Close as Won",
      title: "Mark deal as Won",
      body: `
        <div class="field"><label>Closed amount</label><input type="text" value="$48,000" /></div>
        <div class="field"><label>Closed date</label><input type="date" /></div>
        <div class="field"><label>Win reason (required)</label>
          <select>
            <option>Product fit / features</option>
            <option>Speed of evaluation</option>
            <option>Pricing</option>
            <option>Relationship / trust</option>
            <option>Other</option>
          </select>
        </div>
        <div class="field"><label>Detail</label><textarea placeholder="What sealed it?"></textarea></div>
        <div class="checkbox-line"><input type="checkbox" checked /> <span>Notify customer success</span></div>
        <div class="checkbox-line"><input type="checkbox" /> <span>Trigger onboarding workflow</span></div>
      `,
      primaryLabel: "Close as Won",
      note: "Closed deals contribute to Won/Lost analysis · F2.6",
      onSave: () => {
        toast("🎉 Deal closed Won", { sub: "$48,000 booked · CS notified", duration: 5000 });
        if (typeof window.SS_markDealWon === "function") window.SS_markDealWon();
      },
    }),

    "file-attachment": () => ({
      eyebrow: "M2 · F2.7 · Attach link",
      title: "Attach a file or link",
      body: `
        <div class="field"><label>Link URL</label><input type="text" placeholder="https://docs.google.com/document/d/..." /></div>
        <div class="field"><label>Label</label><input type="text" placeholder="Proposal v3" /></div>
        <div class="field"><label>Type</label>
          <select><option>Proposal</option><option>Quote</option><option>MSA</option><option>NDA</option><option>Order Form</option><option>Other</option></select>
        </div>
        <div class="checkbox-line"><input type="checkbox" checked /> <span>Track open events when shared via email</span></div>
        <div class="field-hint mt-3">Tracking requires a tracking domain to be configured (Phase 2). Phase 1 stores the link only.</div>
      `,
      primaryLabel: "Attach",
      onSave: () => toast("Link attached", { sub: "Visible on the Files tab" }),
    }),

    "tag-picker": () => ({
      eyebrow: "Tags",
      title: "Add tags",
      body: `
        <div class="field"><label>Type to add or search existing tags</label><input type="text" placeholder="e.g. Enterprise, SaaS, Decision Maker" /></div>
        <h4>Existing tags</h4>
        <div class="row" style="flex-wrap: wrap; gap: 8px;">
          <span class="chip">Enterprise</span>
          <span class="chip">SMB</span>
          <span class="chip">SaaS</span>
          <span class="chip">Fintech</span>
          <span class="chip">Decision Maker</span>
          <span class="chip">Champion</span>
          <span class="chip">Series B+</span>
          <span class="chip">Pilot</span>
          <span class="chip">Strategic</span>
        </div>
      `,
      primaryLabel: "Apply tags",
      onSave: () => toast("Tags updated"),
    }),

    "audit-detail": () => ({
      eyebrow: "M9 · F9.3 · Audit Detail",
      title: "Audit entry · field changed",
      body: `
        <dl class="kv-grid mt-2">
          <dt>When</dt><dd class="text-mono">25 May 2026 · 14:12:08 UTC</dd>
          <dt>Actor</dt><dd>Mayur S. <span class="text-muted">(user_8x2k)</span></dd>
          <dt>Action</dt><dd><span class="badge">FIELD CHANGE</span> stage.changed</dd>
          <dt>Object</dt><dd>Deal · Acme — Annual License <span class="text-muted">(deal_a3f9)</span></dd>
          <dt>Before</dt><dd class="text-mono">Qualified</dd>
          <dt>After</dt><dd class="text-mono">Proposal</dd>
          <dt>Session</dt><dd class="text-mono">sess_v8mq2k · 12 min old</dd>
          <dt>IP</dt><dd class="text-mono">115.241.x.x <span class="text-muted">(Mumbai, IN)</span></dd>
          <dt>User-agent</dt><dd class="text-mono" style="font-size:11px;">Mozilla/5.0 (Mac · Chrome 124)</dd>
          <dt>Request ID</dt><dd class="text-mono">req_3kx9pq</dd>
        </dl>
        <h4>Cascading changes (same transaction)</h4>
        <ul class="summary-list">
          <li>
            <div class="left-icon">●</div>
            <div class="grow">probability.changed · 30 → 60</div>
            <span class="meta">same tx</span>
          </li>
          <li>
            <div class="left-icon">●</div>
            <div class="grow">days_in_stage.reset</div>
            <span class="meta">same tx</span>
          </li>
          <li>
            <div class="left-icon">●</div>
            <div class="grow">activity.created · type=StageMove</div>
            <span class="meta">same tx</span>
          </li>
        </ul>
      `,
      primaryLabel: "Export entry",
      note: "Audit entries are immutable · 7-year retention",
      onSave: () => toast("Entry exported", { sub: "Sent to billing@smartsense.io" }),
    }),

    "schema-history": () => ({
      eyebrow: "M1 · F1.1 · Schema History",
      title: "Data model — version history",
      body: `
        <div class="history-row">
          <span class="history-version">v3</span>
          <div class="grow">
            <div style="font-weight:500;">Added Competitor (Deal) · Added Buying Committee (Deal)</div>
            <div class="history-meta">2 days ago · Mayur S. · current</div>
          </div>
          <span class="badge solid">CURRENT</span>
        </div>
        <div class="history-row">
          <span class="history-version">v2</span>
          <div class="grow">
            <div style="font-weight:500;">Added Source (Deal) · Renamed "Acct Type" → "ACV tier"</div>
            <div class="history-meta">1 week ago · Sarah K.</div>
          </div>
          <button class="btn sm">Rollback to v2</button>
        </div>
        <div class="history-row">
          <span class="history-version">v1</span>
          <div class="grow">
            <div style="font-weight:500;">Initial schema · Person, Company, Deal, Task, Note</div>
            <div class="history-meta">14 May 2026 · System (workspace creation)</div>
          </div>
          <button class="btn sm">Rollback to v1</button>
        </div>
        <div class="card mt-4" style="background:var(--paper-warm);">
          <div class="label">ROLLBACK WARNING</div>
          <div class="text-muted mt-2" style="font-size:12px;">
            Rollback creates a NEW version (v4) that reverts to the chosen state. Field values added under deprecated fields are preserved but hidden. Reversible via another rollback.
          </div>
        </div>
      `,
      primaryLabel: "Close",
      note: "All schema changes are audit-logged · F9.3",
      onSave: () => closeSlide(),
    }),
  };

  // ============================================================
  // 5. ACTION REGISTRY (button text → behaviour)
  // ============================================================

  // Buttons that open a slide-over with a "+ New X" form.
  // Match by normalised button text (trimmed, lowercased, no leading +).
  const CREATE_TRIGGERS = {
    "new contact": "new-contact",
    "+ new contact": "new-contact",
    "add contact": "new-contact",
    "new company": "new-company",
    "+ new company": "new-company",
    "add company": "new-company",
    "add person": "new-contact",
    "new deal": "new-deal",
    "+ new deal": "new-deal",
    "add deal": "new-deal",
    "new task": "new-task",
    "+ new task": "new-task",
    "add task": "new-task",
    "quick add": "new-task",
    "log activity": "new-activity",
    "+ log activity": "new-activity",
    "new pipeline": "new-pipeline",
    "+ new pipeline": "new-pipeline",
    "new role": "new-role",
    "+ new role": "new-role",
    "new rule": "new-rule",
    "+ new rule": "new-rule",
    "new object": "new-object",
    "+ new object": "new-object",
    "+ add field": "new-field",
    "+ add field-level rule": "new-field",
    "+ add filter": "new-filter",
    "+ filter": "new-filter",
    "+ add seats": "add-seats",
    "save as smart filter": "save-filter",
    "stage: proposal ▾": "stage-change",
    "stage: discovery ▾": "stage-change",
    "stage: qualified ▾": "stage-change",
    "stage: negotiation ▾": "stage-change",
    "mark won": "mark-won",
    "+ add": "tag-picker",
    "+": "tag-picker",
    "schema history": "schema-history",
  };

  // Buttons that just show a toast confirmation.
  const TOAST_TRIGGERS = {
    "re-enrich": ["Enrichment queued", "Worker started · expect data in ~5s"],
    "re-scan": ["Dedup scan started", "Re-running fuzzy match on 1,847 records"],
    "re-upload": ["Re-upload", "File picker would open in production"],
    "save changes": ["Settings saved", "Applied to your workspace"],
    "save role": ["Role saved", "Takes effect on users' next login"],
    "save & enable sso": ["SSO enabled", "All non-admin users now redirect to your IdP"],
    "test sso flow": ["SSO test passed", "Round-trip with your IdP successful"],
    "rotate token": ["SCIM token rotated", "Old token revoked · update your IdP"],
    "enable scim": ["SCIM enabled", "Provisioning will run on next IdP sync"],
    "export csv": ["Export queued", "Link will be emailed when ready"],
    "lock snapshot": ["Forecast snapshot locked", "Changes after now tracked vs. baseline"],
    "submit to vp": ["Forecast submitted", "Mailed to VP · audit-logged"],
    "publish schema v4": ["Schema v3 → v4 published", "Materialised views rebuilding"],
    "discard changes": ["Changes discarded", "Schema reverted to v3"],
    "discard": ["Changes discarded"],
    "view permissions": ["Opening permission matrix", "Read-only view"],
    "edit": ["Opening editor", "Row editor would open here"],
    "edit columns": ["Column picker", "Drag to reorder columns"],
    "group by stage": ["Grouped by stage", "Toggle off to ungroup"],
    "group by deal": ["Grouped by deal", "Toggle off to ungroup"],
    "settings": ["Pipeline settings", "Manage stages, probabilities, RBAC"],
    "request export": ["GDPR export queued", "Will be emailed in ~10 minutes"],
    "request deletion": ["Workspace deletion requested", "30-day soft-delete window · admins notified", { duration: 5500 }],
    "view audit log": ["Opening audit log"],
    "view": ["Opening detail", "Full record view"],
    "update": ["Payment method updated"],
    "pdf": ["Downloading invoice PDF"],
    "manage pipelines": ["Opening pipeline editor"],
    "selling rules": ["Opening selling rules"],
    "prep": ["Meeting prep opened", "Account brief + recent activity"],
    "apply": ["Filters applied", "Result count updated"],
    "clear": ["Filters cleared"],
    "← prev": ["Previous page"],
    "next →": ["Next page"],
    "← back to upload": ["Back to upload step"],
    "continue to review →": ["Moving to review step"],
    "change": ["Re-mapping column"],
    "map": ["Mapping column"],
    "bulk-merge all high-confidence": ["Bulk-merging 38 high-confidence clusters", "~30 seconds · audit-logged"],
    "merge into selected →": ["Cluster merged", "Records combined · undo available 30d"],
    "skip cluster": ["Cluster skipped", "Will appear again on next scan"],
    "open deal": ["Opening deal"],
    "capture from linkedin": ["Opening Chrome extension preview"],
    "import csv": ["Opening import wizard"],
  };

  function normaliseText(t) {
    return t.replace(/\s+/g, " ").trim().toLowerCase();
  }

  // ============================================================
  // 6. GLOBAL EVENT DELEGATION
  // ============================================================
  function init() {
    // Inject sidebar
    const pageId = document.body.getAttribute("data-page") || "";
    const placeholder = document.querySelector("[data-sidebar]");
    if (placeholder) placeholder.outerHTML = renderSidebar(pageId);

    // Inject proto marker
    if (!document.querySelector(".proto-marker")) {
      const m = document.createElement("div");
      m.className = "proto-marker";
      m.textContent = "Prototype · v1.1 · Phase 1";
      document.body.appendChild(m);
    }

    // Pre-existing data-toggle wiring
    document.querySelectorAll("[data-toggle]").forEach(el => {
      if (el.dataset.toggleWired) return;
      el.dataset.toggleWired = "1";
      el.addEventListener("click", () => el.classList.toggle("on"));
    });

    // Kanban card navigation
    document.querySelectorAll(".kanban-card").forEach(c => {
      c.addEventListener("click", function (ev) {
        if (ev.target.closest("a")) return;
        const href = c.getAttribute("data-href");
        if (href) window.location.href = href;
      });
    });

    // Record-tab switching
    document.querySelectorAll(".record-tab-bar .record-tab[data-tab]").forEach(tab => {
      tab.addEventListener("click", () => {
        const tabId = tab.getAttribute("data-tab");
        document.querySelectorAll(".record-tab-bar .record-tab").forEach(t => t.classList.remove("active"));
        document.querySelectorAll(".tab-pane").forEach(p => {
          p.classList.remove("active");
          p.style.display = "none";
        });
        tab.classList.add("active");
        const target = document.querySelector(`.tab-pane[data-pane="${tabId}"]`);
        if (target) {
          target.classList.add("active");
          target.style.display = "";
        }
      });
    });

    // Stepper navigation
    document.querySelectorAll(".stepper-step[data-step-href]").forEach(s => {
      s.style.cursor = "pointer";
      s.addEventListener("click", () => window.location.href = s.getAttribute("data-step-href"));
    });

    // Esc handler
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") closeSlide();
    });

    // GLOBAL CLICK DELEGATION
    document.addEventListener("click", e => {
      // 1. Chip × removal
      if (e.target.classList && e.target.classList.contains("chip-x")) {
        const chip = e.target.closest(".chip");
        if (chip) {
          chip.classList.add("removing");
          setTimeout(() => chip.remove(), 200);
          toast("Filter removed", { sub: "List re-queried" });
        }
        return;
      }

      // 2. Skip clicks inside slide-over, search, links, and explicit data-action targets handled elsewhere
      if (e.target.closest(".slide-over")) return;
      if (e.target.closest("a")) return;

      // 3. Search trigger
      if (e.target.closest("[data-action='open-search']")) {
        e.preventDefault();
        toast("Cmd+K search", { sub: "Records, filters, pages · permission-scoped" });
        return;
      }

      // 4. Button delegation
      const btn = e.target.closest("button");
      if (!btn) return;

      // If the button has an inline onclick handler, let it run alone — do not add a toast on top.
      if (btn.hasAttribute("onclick")) return;

      // Skip system buttons (icon-btn ° "?", close X buttons, etc.) if no meaningful text
      const text = normaliseText(btn.textContent || "");
      if (!text || text === "?" || text === "○" || text === "×") return;

      // Skip tab buttons (already wired) and toggles
      if (btn.classList.contains("record-tab")) return;
      if (btn.hasAttribute("data-toggle")) return;
      if (btn.classList.contains("slide-close")) return;

      // 5. Create-triggers (slide-over)
      if (CREATE_TRIGGERS.hasOwnProperty(text)) {
        e.preventDefault();
        const formKey = CREATE_TRIGGERS[text];
        const formFn = Forms[formKey];
        if (formFn) {
          // Detect context: if deal page, prefill company; if from a contact page, etc.
          let ctx = {};
          if (pageId === "companies") ctx.company = "(Selected company)";
          if (pageId === "contacts") ctx.linkedTo = "(Selected contact)";
          openSlide(formFn(ctx));
        } else {
          toast("Action: " + btn.textContent.trim());
        }
        return;
      }

      // 6. Toast triggers
      if (TOAST_TRIGGERS.hasOwnProperty(text)) {
        e.preventDefault();
        const [msg, sub, opts] = TOAST_TRIGGERS[text];
        toast(msg, { sub, ...(opts || {}) });
        return;
      }

      // 7. Generic fallback for any other button — visible feedback so nothing feels dead
      if (btn.type !== "submit" && !btn.disabled) {
        // Skip buttons that are explicitly "checkboxes" or part of a form via parent
        const label = btn.textContent.trim();
        if (label && label.length < 40 && !btn.dataset.skipDelegation) {
          e.preventDefault();
          toast(label, { sub: "Action acknowledged" });
        }
      }
    });

    // Listen on select changes
    document.addEventListener("change", e => {
      if (e.target.matches("select.btn")) {
        toast("Switched", { sub: e.target.value });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Expose key helpers to global scope so the gap-fix IIFE can reuse them
  window.SS_openSlide = function (formKey, ctx) {
    const tpl = Forms[formKey];
    if (!tpl) return;
    openSlide(tpl(ctx));
  };
  window.SS_closeSlide = closeSlide;
  window.SS_toast = toast;
})();
// ============================================================
// GAP-FIX ADDITIONS — appended for Critical + Important resolutions
// Wrapped in its own IIFE; the original chrome.js exposes
// `window.SS = { toast, openSlide, closeSlide }` via a tiny shim
// added just before this block.
// ============================================================
(function () {
  // Wait for DOM ready
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  // ============================================================
  // Public helpers (toast / openSlide / closeSlide) re-exposed
  // for these add-on handlers
  // ============================================================
  const SS = window.SS || {};
  if (!SS.toast) {
    SS.toast = function (msg, opts) {
      const stack = document.querySelector(".toast-stack") || (() => {
        const s = document.createElement("div");
        s.className = "toast-stack";
        document.body.appendChild(s);
        return s;
      })();
      const t = document.createElement("div");
      t.className = "toast show";
      const sub = (opts && opts.sub) ? `<div class="toast-sub">${opts.sub}</div>` : "";
      t.innerHTML = `<div class="toast-body"><div class="toast-msg">${msg}</div>${sub}</div><button class="toast-x">×</button>`;
      stack.appendChild(t);
      setTimeout(() => {
        t.classList.add("dismissing");
        setTimeout(() => t.remove(), 200);
      }, (opts && opts.duration) || 3500);
      t.querySelector(".toast-x").addEventListener("click", () => t.remove());
    };
    window.SS = SS;
  }

  // ============================================================
  // ROLES (D1, A2) — defines roles and the "View as" switcher
  // ============================================================
  const ROLES = {
    WA: { name: "Workspace Admin", desc: "Tenant owner — billing, SSO, audit, residency" },
    SR: { name: "Sales Rep", desc: "Daily-driver IC — owns contacts, deals, activities" },
    SM: { name: "Sales Manager", desc: "Team lead — pipeline review, forecast, coaching" },
    RO: { name: "RevOps Lead", desc: "Schema, pipelines, selling rules, data hygiene" },
    JR: { name: "Junior Rep", desc: "Restricted: cannot see deals where amount > $100k" },
  };

  function getRole() {
    return localStorage.getItem("ss_role") || "WA";
  }

  function setRole(role) {
    localStorage.setItem("ss_role", role);
    applyRole(role);
  }

  function applyRole(role) {
    document.body.setAttribute("data-role", role);
    const r = ROLES[role];
    // Update user chip
    const chip = document.querySelector(".user-role");
    if (chip) chip.textContent = r.name;
    const avatar = document.querySelector(".user-chip .avatar");
    if (avatar) {
      const initials = { WA: "MS", SR: "AR", SM: "PK", RO: "ND", JR: "JL" }[role];
      avatar.textContent = initials;
    }
    const userName = document.querySelector(".user-name");
    if (userName) {
      const names = { WA: "Mayur S.", SR: "Aria R.", SM: "Priya K.", RO: "Niko D.", JR: "Jordan L." };
      userName.textContent = names[role];
    }
    // Update role switcher pill
    const pill = document.querySelector(".role-switcher .role-pill");
    if (pill) pill.textContent = role;
    // Update Junior-Rep restricted values
    document.querySelectorAll("[data-junior-restricted]").forEach(el => {
      if (role === "JR") {
        if (!el.dataset.origValue) el.dataset.origValue = el.innerHTML;
        el.innerHTML = '<span class="restricted-value">Restricted</span>';
      } else if (el.dataset.origValue) {
        el.innerHTML = el.dataset.origValue;
      }
    });
    // Update Junior-Rep filtered rows
    document.querySelectorAll("[data-jr-hidden]").forEach(el => {
      el.style.display = (role === "JR") ? "none" : "";
    });
    // Update role-aware copy
    document.querySelectorAll("[data-role-text]").forEach(el => {
      const map = JSON.parse(el.dataset.roleText);
      el.textContent = map[role] || map.default || el.textContent;
    });
  }

  function injectRoleSwitcher() {
    const topbarActions = document.querySelector(".topbar-actions");
    if (!topbarActions) return;
    const role = getRole();
    const switcher = document.createElement("button");
    switcher.className = "role-switcher";
    switcher.setAttribute("aria-label", "View as");
    switcher.innerHTML = `<span>View as</span><span class="role-pill">${role}</span>`;
    topbarActions.insertBefore(switcher, topbarActions.firstChild);

    const menu = document.createElement("div");
    menu.className = "role-switcher-menu";
    menu.innerHTML = Object.entries(ROLES).map(([code, r]) => `
      <button class="role-option ${code === role ? 'active' : ''}" data-role-set="${code}">
        <div class="role-code">${code} · ${code === role ? 'current' : 'switch to'}</div>
        <div class="role-name">${r.name}</div>
        <div class="role-desc">${r.desc}</div>
      </button>
    `).join("");
    document.body.appendChild(menu);

    switcher.addEventListener("click", e => {
      e.stopPropagation();
      menu.classList.toggle("open");
    });
    menu.addEventListener("click", e => {
      const opt = e.target.closest("[data-role-set]");
      if (opt) {
        const newRole = opt.dataset.roleSet;
        setRole(newRole);
        menu.classList.remove("open");
        SS.toast(`Now viewing as ${ROLES[newRole].name}`, { sub: "Some screens and fields will change" });
        // Re-style active option
        menu.querySelectorAll(".role-option").forEach(o => o.classList.remove("active"));
        opt.classList.add("active");
      }
    });
    document.addEventListener("click", () => menu.classList.remove("open"));
  }

  // ============================================================
  // SMART FILTER URL HANDLING (A6)
  // ============================================================
  function applySmartFilter() {
    const params = new URLSearchParams(window.location.search);
    const filter = params.get("filter");
    if (!filter) return;
    // Display a "smart filter active" banner near the page header
    const pageHeader = document.querySelector(".page-header");
    if (!pageHeader) return;
    const filterLabels = {
      "my": "My Open Pipeline",
      "stalled": "Stalled Deals",
      "new": "New This Week",
    };
    const banner = document.createElement("div");
    banner.className = "card";
    banner.style.cssText = "background:var(--paper-warm); border-left:3px solid var(--ink); margin-bottom:16px; padding:12px 16px; display:flex; align-items:center; gap:12px; font-size:13px;";
    banner.innerHTML = `
      <span class="badge solid">SMART FILTER</span>
      <strong>${filterLabels[filter] || filter}</strong>
      <span class="text-muted">applied · showing matching results</span>
      <a href="${window.location.pathname}" style="margin-left:auto; font-size:12px;">Clear filter</a>
    `;
    pageHeader.after(banner);
  }

  // ============================================================
  // CONFIRMATION MODAL (G1, G2, G3, G4) — typed/checkbox confirms
  // ============================================================
  function confirmDanger(opts) {
    const overlay = document.createElement("div");
    overlay.className = "confirm-modal";
    const requiresTyped = !!opts.typeToConfirm;
    overlay.innerHTML = `
      <div class="confirm-modal-panel">
        <div class="confirm-eyebrow">${opts.eyebrow || "Confirm action"}</div>
        <h2>${opts.title}</h2>
        <div class="confirm-body">${opts.body}</div>
        ${opts.callout ? `<div class="confirm-callout">${opts.callout}</div>` : ""}
        ${requiresTyped ? `
          <div class="confirm-type-field">
            <label class="label" style="display:block;margin-bottom:6px;">Type <span class="text-mono" style="background:var(--ink-05);padding:2px 6px;border-radius:2px;">${opts.typeToConfirm}</span> to confirm</label>
            <input type="text" class="type-confirm-input" placeholder="${opts.typeToConfirm}" autocomplete="off" />
          </div>
        ` : ""}
        ${opts.checkboxes ? opts.checkboxes.map((c, i) => `
          <div class="checkbox-line"><input type="checkbox" class="confirm-check" data-idx="${i}" /> <span>${c}</span></div>
        `).join("") : ""}
        <div class="confirm-actions">
          <button class="btn confirm-cancel">Cancel</button>
          <button class="btn danger confirm-go" ${requiresTyped || opts.checkboxes ? "disabled" : ""}>${opts.confirmLabel || "Confirm"}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const goBtn = overlay.querySelector(".confirm-go");
    const checks = overlay.querySelectorAll(".confirm-check");
    const typed = overlay.querySelector(".type-confirm-input");

    function recheck() {
      const allChecked = !checks.length || Array.from(checks).every(c => c.checked);
      const typedOK = !typed || typed.value === opts.typeToConfirm;
      goBtn.disabled = !(allChecked && typedOK);
    }
    checks.forEach(c => c.addEventListener("change", recheck));
    if (typed) typed.addEventListener("input", recheck);

    const close = () => overlay.remove();
    overlay.querySelector(".confirm-cancel").addEventListener("click", close);
    overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
    goBtn.addEventListener("click", () => {
      close();
      if (opts.onConfirm) opts.onConfirm();
    });
    document.addEventListener("keydown", function escClose(e) {
      if (e.key === "Escape") { close(); document.removeEventListener("keydown", escClose); }
    });
  }

  // ============================================================
  // NOTIFICATIONS DRAWER + HELP DRAWER (G11)
  // ============================================================
  function buildNotifications() {
    const drawer = document.createElement("div");
    drawer.className = "notif-drawer";
    drawer.id = "notif-drawer";
    drawer.innerHTML = `
      <div class="drawer-head">
        <h3>Notifications</h3>
        <button class="btn sm">Mark all read</button>
      </div>
      <div class="drawer-body">
        <div class="notif-item unread">
          <div class="notif-meta">2 min ago · DEAL</div>
          <div class="notif-title">Acme — Annual License moved to Proposal</div>
          <div class="notif-body">Mayur S. updated the stage</div>
        </div>
        <div class="notif-item unread">
          <div class="notif-meta">15 min ago · ROTTING</div>
          <div class="notif-title">Northwind — Multi-year flagged as stalled</div>
          <div class="notif-body">27 days in Proposal without activity</div>
        </div>
        <div class="notif-item unread">
          <div class="notif-meta">1 hr ago · BILLING</div>
          <div class="notif-title">Seat usage at 95%</div>
          <div class="notif-body">38 of 40 seats used · auto-alert from F9.4</div>
        </div>
        <div class="notif-item">
          <div class="notif-meta">3 hr ago · MENTION</div>
          <div class="notif-title">Sarah K. mentioned you in a note</div>
          <div class="notif-body">"@mayur please send security PDF before next call"</div>
        </div>
        <div class="notif-item">
          <div class="notif-meta">Yesterday · SCHEMA</div>
          <div class="notif-title">Schema v2 → v3 published</div>
          <div class="notif-body">2 fields added to Deal object</div>
        </div>
      </div>
    `;
    document.body.appendChild(drawer);
    document.addEventListener("click", e => {
      if (!drawer.contains(e.target) && !e.target.closest("[data-trigger='notifications']")) {
        drawer.classList.remove("open");
      }
    });
  }

  function buildHelpDrawer() {
    const drawer = document.createElement("div");
    drawer.className = "notif-drawer";
    drawer.id = "help-drawer";
    drawer.innerHTML = `
      <div class="drawer-head">
        <h3>Keyboard shortcuts</h3>
        <button class="btn sm" onclick="window.open('https://docs.smartsense.io', '_blank')">Docs ↗</button>
      </div>
      <div class="drawer-body">
        <div style="padding: 14px;">
          <div class="label mb-2">Navigation</div>
          <table style="width:100%; font-size:12px; margin-bottom:16px;">
            <tr><td>Global search</td><td style="text-align:right;"><span class="kbd">⌘</span> <span class="kbd">K</span></td></tr>
            <tr><td>Go to Deals</td><td style="text-align:right;"><span class="kbd">G</span> <span class="kbd">D</span></td></tr>
            <tr><td>Go to Contacts</td><td style="text-align:right;"><span class="kbd">G</span> <span class="kbd">C</span></td></tr>
            <tr><td>Go to My Day</td><td style="text-align:right;"><span class="kbd">G</span> <span class="kbd">H</span></td></tr>
          </table>
          <div class="label mb-2">Actions</div>
          <table style="width:100%; font-size:12px; margin-bottom:16px;">
            <tr><td>New record</td><td style="text-align:right;"><span class="kbd">⌘</span> <span class="kbd">N</span></td></tr>
            <tr><td>Save current</td><td style="text-align:right;"><span class="kbd">⌘</span> <span class="kbd">S</span></td></tr>
            <tr><td>Close panel</td><td style="text-align:right;"><span class="kbd">Esc</span></td></tr>
            <tr><td>Show this help</td><td style="text-align:right;"><span class="kbd">?</span></td></tr>
          </table>
          <div class="text-muted" style="font-size:11px;">Shortcuts work everywhere except when editing text.</div>
        </div>
      </div>
    `;
    document.body.appendChild(drawer);
    document.addEventListener("click", e => {
      if (!drawer.contains(e.target) && !e.target.closest("[data-trigger='help']")) {
        drawer.classList.remove("open");
      }
    });
  }

  // ============================================================
  // USER CHIP POPOVER (G12)
  // ============================================================
  function buildUserPopover() {
    const sidebar = document.querySelector(".sidebar-footer");
    if (!sidebar) return;
    const userChip = sidebar.querySelector(".user-chip");
    if (!userChip) return;
    userChip.style.cursor = "pointer";

    const popover = document.createElement("div");
    popover.className = "user-popover";
    popover.innerHTML = `
      <button data-action="profile">Profile & preferences</button>
      <button data-action="theme">Switch theme</button>
      <div class="menu-sep"></div>
      <button data-action="help">Help & shortcuts</button>
      <button data-action="invite">Invite teammates</button>
      <div class="menu-sep"></div>
      <button data-action="signout">Sign out</button>
    `;
    sidebar.appendChild(popover);

    userChip.addEventListener("click", e => {
      e.stopPropagation();
      popover.classList.toggle("open");
    });
    popover.addEventListener("click", e => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const a = btn.dataset.action;
      popover.classList.remove("open");
      if (a === "signout") {
        window.location.href = "index.html";
      } else if (a === "help") {
        document.getElementById("help-drawer")?.classList.add("open");
      } else if (a === "invite") {
        SS.toast("Invite slide-over", { sub: "Stub for prototype · would open invite form" });
      } else if (a === "profile") {
        SS.toast("Profile", { sub: "User preferences (Phase 2 build)" });
      } else if (a === "theme") {
        SS.toast("Theme", { sub: "Light / dark · Phase 2" });
      }
    });
    document.addEventListener("click", e => {
      if (!popover.contains(e.target) && !userChip.contains(e.target)) {
        popover.classList.remove("open");
      }
    });
  }

  // ============================================================
  // POST-ACTION UI UPDATES (A4, G14, B11)
  // ============================================================
  function wirePostActions() {
    // 1. Task checkbox completion (B11)
    document.addEventListener("change", e => {
      const cb = e.target;
      if (cb.type !== "checkbox") return;
      const row = cb.closest("tr");
      if (!row) return;
      const inTasksTable = row.closest("table");
      const pageId = document.body.getAttribute("data-page");
      if (pageId !== "tasks" || !inTasksTable) return;
      if (cb.closest("th")) return;
      if (cb.checked) {
        row.classList.add("task-completed");
        SS.toast("Task marked complete", { sub: "Moved to Completed" });
      } else {
        row.classList.remove("task-completed");
      }
    });

    // 2. Mark Won → reveals a "won banner" + moves card (A4, G14)
    window.SS_markDealWon = function () {
      const detailHeader = document.querySelector(".page-header");
      if (!detailHeader) return;
      // Insert a won banner
      const banner = document.createElement("div");
      banner.className = "won-banner";
      banner.innerHTML = `
        <div class="won-icon">★</div>
        <div class="won-text">
          <div class="won-title">Deal closed Won — $48,000 booked</div>
          <div class="won-sub">Customer Success notified · Onboarding workflow available</div>
        </div>
        <div class="won-actions">
          <button class="btn ghost">Trigger onboarding</button>
          <button class="btn">View won deals</button>
        </div>
      `;
      detailHeader.after(banner);
      // Update KPIs in place
      const kpis = document.querySelectorAll(".kpi");
      if (kpis[2]) {
        kpis[2].querySelector(".kpi-value").textContent = "Closed";
        kpis[2].querySelector(".kpi-delta").textContent = "Today · 26 May";
      }
      // Hide the action buttons for an open deal
      document.querySelectorAll(".topbar-actions .btn, .page-header .btn").forEach(btn => {
        const t = (btn.textContent || "").trim();
        if (t === "Mark Won" || t === "Stage: Proposal ▾") btn.style.display = "none";
      });
    };
  }

  // ============================================================
  // BULK ACTION TOOLBAR (F2)
  // ============================================================
  function wireBulkToolbar() {
    const pageId = document.body.getAttribute("data-page");
    const bulkPages = ["contacts", "companies", "deals", "tasks"];
    if (!bulkPages.includes(pageId)) return;
    const tables = document.querySelectorAll(".table");
    if (!tables.length) return;

    // Find tables with checkbox header
    tables.forEach(table => {
      const checkboxes = table.querySelectorAll("tbody input[type='checkbox']");
      if (!checkboxes.length) return;

      const toolbar = document.createElement("div");
      toolbar.className = "bulk-toolbar";
      const cfg = {
        contacts: { actions: ["Add tag", "Assign owner", "Export", "Archive"], danger: "Archive" },
        companies: { actions: ["Add tag", "Assign owner", "Export", "Archive"], danger: "Archive" },
        deals: { actions: ["Update stage", "Assign owner", "Export"], danger: null },
        tasks: { actions: ["Mark complete", "Reassign", "Delete"], danger: "Delete" },
      }[pageId];
      const actionsHtml = cfg.actions.map(a => {
        const cls = a === cfg.danger ? " danger" : "";
        return `<button class="bulk-action${cls}" data-bulk-action="${a.toLowerCase().replace(/\s+/g, '-')}">${a}</button>`;
      }).join("");
      toolbar.innerHTML = `
        <span class="bulk-count">0 selected</span>
        <div class="bulk-divider"></div>
        ${actionsHtml}
        <button class="bulk-clear">Clear selection</button>
      `;
      table.parentNode.insertBefore(toolbar, table);

      function updateCount() {
        const checked = table.querySelectorAll("tbody input[type='checkbox']:checked").length;
        toolbar.querySelector(".bulk-count").textContent = `${checked} selected`;
        toolbar.classList.toggle("show", checked > 0);
      }
      checkboxes.forEach(cb => cb.addEventListener("change", updateCount));
      toolbar.querySelector(".bulk-clear").addEventListener("click", () => {
        table.querySelectorAll("tbody input[type='checkbox']:checked").forEach(cb => cb.checked = false);
        updateCount();
      });
      toolbar.querySelectorAll(".bulk-action").forEach(b => {
        b.addEventListener("click", () => {
          const label = b.textContent.trim();
          const count = table.querySelectorAll("tbody input[type='checkbox']:checked").length;
          if (b.classList.contains("danger")) {
            confirmDanger({
              eyebrow: "Bulk action",
              title: `${label} ${count} item${count !== 1 ? "s" : ""}?`,
              body: `This will ${label.toLowerCase()} ${count} selected row${count !== 1 ? "s" : ""}. This action can be undone within 30 days from the audit log.`,
              confirmLabel: label,
              onConfirm: () => {
                SS.toast(`${count} item${count !== 1 ? "s" : ""} ${label.toLowerCase()}d`, { sub: "30-day undo available" });
              },
            });
          } else {
            SS.toast(`${label} · ${count} item${count !== 1 ? "s" : ""}`, { sub: "Bulk action applied" });
          }
        });
      });
    });
  }

  // ============================================================
  // SPECIFIC CONFIRMATION TRIGGERS (G1, G2, G3, G4)
  // ============================================================
  function wireDestructiveConfirms() {
    document.addEventListener("click", e => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const text = (btn.textContent || "").trim().toLowerCase();

      // G1: bulk-merge confirmation
      if (text === "bulk-merge all high-confidence") {
        e.preventDefault();
        e.stopImmediatePropagation();
        confirmDanger({
          eyebrow: "Dedup · Bulk merge",
          title: "Merge 38 high-confidence clusters?",
          body: "This will merge 38 duplicate clusters covering 84 contact records. Activities and references will be combined into the highest-activity record in each cluster.",
          callout: "Reversible for 30 days via Audit Log · F9.3",
          checkboxes: ["I've reviewed at least one cluster manually and trust the high-confidence threshold"],
          confirmLabel: "Merge 38 clusters",
          onConfirm: () => {
            SS.toast("Bulk-merge running", { sub: "~30 seconds · audit-logged" });
            setTimeout(() => SS.toast("38 clusters merged", { sub: "84 → 38 records · undo available 30d", duration: 5000 }), 1500);
          },
        });
      }

      // G2: workspace deletion (typed-confirmation)
      if (text === "request deletion") {
        e.preventDefault();
        e.stopImmediatePropagation();
        confirmDanger({
          eyebrow: "Workspace deletion · IRREVERSIBLE",
          title: "Delete the SmartSense workspace?",
          body: "This permanently deletes the workspace, including all records, activities, audit logs, and user accounts. A final ZIP export will be emailed to admins. Soft-delete window: 30 days.",
          callout: "All 38 users will lose access immediately on confirmation.",
          typeToConfirm: "SmartSense",
          checkboxes: [
            "I am the Workspace Admin or higher",
            "I understand this affects 38 users and 1,847 contacts",
            "I have downloaded a final export (or will accept the auto-export)",
          ],
          confirmLabel: "Request deletion",
          onConfirm: () => {
            SS.toast("Workspace deletion requested", { sub: "30-day soft-delete window · admins emailed", duration: 6000 });
          },
        });
      }

      // G3: enforce-SSO warning (intercepts the data-confirm="enforce-sso" button)
      if (btn.getAttribute("data-confirm") === "enforce-sso") {
        e.preventDefault();
        e.stopImmediatePropagation();
        confirmDanger({
          eyebrow: "Authentication · Enforce SSO",
          title: "Enable and enforce SSO for all non-admins?",
          body: "Once enforced, password login is disabled for all users except Workspace Admins. If the IdP is misconfigured or goes down, your team will be locked out until either the IdP is fixed or an admin disables enforcement.",
          callout: "Recommended: click \"Test SSO flow\" first and verify with a teammate before enforcing.",
          checkboxes: [
            "I have tested the SSO flow successfully",
            "I understand non-admins lose password login",
            "At least one Workspace Admin retains password access",
          ],
          confirmLabel: "Enable & enforce SSO",
          onConfirm: () => {
            SS.toast("SSO enabled and enforced", { sub: "All non-admin sessions will redirect on next request", duration: 5500 });
          },
        });
      }
    });
  }

  // Form-validation example for slide-over: hook into "Save" clicks
  // and demonstrate the error state if the first input is empty
  function wireFormValidation() {
    document.addEventListener("click", e => {
      const primary = e.target.closest(".slide-foot .btn.primary");
      if (!primary) return;
      const slide = primary.closest(".slide-over");
      if (!slide) return;
      // Find required-marked fields
      const firstInput = slide.querySelector(".slide-body input[type='text'], .slide-body input[type='email']");
      if (firstInput && firstInput.value.trim() === "" && firstInput.placeholder !== "(optional)" && !firstInput.dataset.validated) {
        e.preventDefault();
        e.stopImmediatePropagation();
        firstInput.dataset.validated = "1";
        const field = firstInput.closest(".field");
        field.classList.add("field-error");
        if (!field.querySelector(".field-error-text")) {
          const err = document.createElement("div");
          err.className = "field-error-text";
          err.textContent = "This field is required";
          field.appendChild(err);
        }
        // Top-of-slide error banner
        let banner = slide.querySelector(".slide-error-banner");
        if (!banner) {
          banner = document.createElement("div");
          banner.className = "slide-error-banner show";
          banner.innerHTML = `<div class="err-title">Couldn't save — 1 field needs attention</div><div class="err-detail">Required fields are marked with *. Fix the highlighted field below and try again.</div>`;
          slide.querySelector(".slide-body").prepend(banner);
        } else {
          banner.classList.add("show");
        }
        firstInput.focus();
        firstInput.addEventListener("input", () => {
          if (firstInput.value.trim()) {
            field.classList.remove("field-error");
            banner.classList.remove("show");
          }
        });
      }
    }, true); // capture phase
  }

  // ============================================================
  // INDICATOR ICON BUTTONS (G11) — notification + help triggers
  // ============================================================
  function wireTopbarIcons() {
    const icons = document.querySelectorAll(".topbar-actions .icon-btn");
    icons.forEach(icon => {
      const title = icon.getAttribute("title") || "";
      if (title.toLowerCase() === "notifications") {
        icon.setAttribute("data-trigger", "notifications");
        icon.removeAttribute("onclick");
        icon.addEventListener("click", e => {
          e.stopPropagation();
          document.getElementById("notif-drawer")?.classList.toggle("open");
        });
        // unread counter pip
        icon.innerHTML = '<span style="position:relative;">○<span style="position:absolute;top:-4px;right:-6px;width:6px;height:6px;background:var(--ink);border-radius:50%;"></span></span>';
      }
      if (title.toLowerCase() === "help") {
        icon.setAttribute("data-trigger", "help");
        icon.addEventListener("click", e => {
          e.stopPropagation();
          document.getElementById("help-drawer")?.classList.toggle("open");
        });
      }
    });
  }

  // ============================================================
  // KPI CLICKABILITY (G10)
  // ============================================================
  function wireKpiClicks() {
    const pageId = document.body.getAttribute("data-page");
    if (pageId !== "my-day") return;
    const kpis = document.querySelectorAll(".kpi");
    const routes = [
      { selector: "Pipeline this quarter", href: "deals.html?filter=my" },
      { selector: "Forecast", href: "deals-forecast.html" },
      { selector: "Activities this week", href: "activities.html" },
      { selector: "Stalled deals", href: "deals.html?filter=stalled" },
    ];
    kpis.forEach((k, i) => {
      const r = routes[i];
      if (!r) return;
      k.classList.add("clickable");
      k.addEventListener("click", () => window.location.href = r.href);
    });
  }

  // ============================================================
  // OVERRIDE TOAST_TRIGGERS that should actually navigate
  // (G6, G7, G8)
  // ============================================================
  function wireNavigationOverrides() {
    document.addEventListener("click", e => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const text = (btn.textContent || "").trim().toLowerCase();
      const pageId = document.body.getAttribute("data-page");

      // Context-aware: "View" inside the audit log table opens the audit-detail slide-over
      if (pageId === "settings-audit-log" && text === "view") {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (window.SS_openSlide) window.SS_openSlide("audit-detail");
        return;
      }
      // Context-aware: "View permissions" on settings-roles toasts (matrix is on the same page)
      if (pageId === "settings-roles" && text === "view permissions") {
        // Let the existing toast trigger fire (matrix is on the same page)
        return;
      }

      const navMap = {
        "manage pipelines": "settings-pipelines.html",
        "selling rules": "settings-selling-rules.html",
        "open deal": "deal-detail.html",
        "view audit log": "settings-audit-log.html",
      };
      if (navMap[text]) {
        e.preventDefault();
        e.stopImmediatePropagation();
        window.location.href = navMap[text];
      }
    }, true);
  }

  // ============================================================
  // BOOT
  // ============================================================
  ready(() => {
    injectRoleSwitcher();
    applyRole(getRole());
    applySmartFilter();
    buildNotifications();
    buildHelpDrawer();
    buildUserPopover();
    wirePostActions();
    wireBulkToolbar();
    wireDestructiveConfirms();
    wireFormValidation();
    wireTopbarIcons();
    wireKpiClicks();
    wireNavigationOverrides();
  });
})();
