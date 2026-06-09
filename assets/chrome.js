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
      { id: "emails",    href: "emails.html",     label: "Email",      icon: "✉", count: "3" },
      { id: "tasks",     href: "tasks.html",      label: "Tasks",      icon: "✓", count: "8" },
    ]},
    { group: "Tools", items: [
      { id: "import",    href: "import-upload.html",    label: "Add Contact - Import CSV", icon: "↓", count: "" },
      { id: "linkedin",  href: "linkedin-capture.html", label: "LinkedIn Capture",         icon: "in", count: "" },
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
        <div class="search-trigger">
          <input type="search" id="sidebar-search-input" placeholder="Search anything" autocomplete="off" spellcheck="false" />
          <span class="kbd">⌘K</span>
        </div>
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
      if (onSave && onSave(panel) === false) return;
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
      wireFormFormatters(panel);
    }, 260);
  }

  function closeSlide() {
    const backdrop = document.querySelector(".slide-backdrop");
    const panel = document.querySelector(".slide-over");
    if (backdrop) backdrop.classList.remove("open");
    if (panel) panel.classList.remove("open");
  }

  // ============================================================
  // FORM FORMATTERS — E4 (currency) · E5 (date) · E10 (tags)
  // ============================================================
  function wireFormFormatters(panel) {
    if (!panel) return;

    // E4 — Currency blur: 48000 → $48,000 ; focus restores raw value
    panel.querySelectorAll("input[id*='amount']").forEach(function (inp) {
      inp.addEventListener("blur", function () {
        var raw = parseFloat(String(inp.value).replace(/[^0-9.]/g, ""));
        if (!isNaN(raw) && raw > 0) {
          inp.dataset.raw = String(raw);
          inp.setAttribute("type", "text");
          inp.value = "$" + raw.toLocaleString("en-US");
        }
      });
      inp.addEventListener("focus", function () {
        if (inp.dataset.raw) {
          inp.setAttribute("type", "number");
          inp.value = inp.dataset.raw;
        }
      });
    });

    // E5 — Date friendly display: shows "03 Jun 2026" below the date picker
    var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    panel.querySelectorAll("input[type='date']").forEach(function (inp) {
      var disp = document.createElement("small");
      disp.style.cssText = "color:var(--ink-50);font-size:11px;margin-top:3px;display:block;font-family:var(--mono);";
      if (inp.parentNode) inp.parentNode.insertBefore(disp, inp.nextSibling);
      function refreshDate() {
        if (!inp.value) { disp.textContent = ""; return; }
        var p = inp.value.split("-");
        var d = parseInt(p[2], 10);
        disp.textContent = (d < 10 ? "0" + String(d) : String(d)) + " " + MONTHS[parseInt(p[1], 10) - 1] + " " + p[0];
      }
      inp.addEventListener("change", refreshDate);
      inp.addEventListener("blur", refreshDate);
    });

    // E10 — Tag input: Enter to add · suggestion chips · chip removal
    var tagInput = panel.querySelector("#slide-nc-tags-input");
    var tagChips = panel.querySelector("#slide-nc-tags-chips");
    if (tagInput && tagChips) {
      var activeTags = [];
      function renderTagChips() {
        tagChips.innerHTML = activeTags.map(function (t) {
          return "<span class='chip' style='cursor:default;'>" + t +
            " <span data-remove-tag='" + t + "' style='margin-left:4px;cursor:pointer;color:var(--ink-50);'>×</span></span>";
        }).join("");
        tagChips.querySelectorAll("[data-remove-tag]").forEach(function (x) {
          x.addEventListener("click", function () {
            activeTags = activeTags.filter(function (t) { return t !== x.dataset.removeTag; });
            renderTagChips();
          });
        });
      }
      tagInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          var val = tagInput.value.trim();
          if (val && activeTags.indexOf(val) === -1) { activeTags.push(val); renderTagChips(); }
          tagInput.value = "";
        }
      });
      panel.querySelectorAll(".tag-suggest").forEach(function (s) {
        s.addEventListener("click", function () {
          var t = s.dataset.tag;
          if (t && activeTags.indexOf(t) === -1) { activeTags.push(t); renderTagChips(); }
        });
      });
    }
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
          <div class="field"><label>First name<span class="field-required-marker">*</span></label><input type="text" id="slide-nc-firstname" placeholder="Sarah" /><div class="field-error-text">First name is required</div></div>
          <div class="field"><label>Last name<span class="field-required-marker">*</span></label><input type="text" id="slide-nc-lastname" placeholder="Chen" /></div>
        </div>
        <div class="field"><label>Work email</label><input type="email" id="slide-nc-email" placeholder="sarah.chen@acme.com" /></div>
        <div class="field"><label>Title</label><input type="text" id="slide-nc-title" placeholder="VP Engineering" /></div>
        <div class="field">
          <label>Phone</label>
          <div style="display:flex;">
            <select id="slide-nc-phone-cc" style="width:140px;flex-shrink:0;border-radius:4px 0 0 4px;border-right:0;">
              <option value="+93"   data-min="9"  data-max="9" >+93   Afghanistan</option>
              <option value="+355"  data-min="8"  data-max="9" >+355  Albania</option>
              <option value="+213"  data-min="9"  data-max="9" >+213  Algeria</option>
              <option value="+376"  data-min="6"  data-max="8" >+376  Andorra</option>
              <option value="+244"  data-min="9"  data-max="9" >+244  Angola</option>
              <option value="+1264" data-min="7"  data-max="7" >+1264 Anguilla</option>
              <option value="+1268" data-min="7"  data-max="7" >+1268 Antigua</option>
              <option value="+54"   data-min="10" data-max="10">+54   Argentina</option>
              <option value="+374"  data-min="8"  data-max="8" >+374  Armenia</option>
              <option value="+297"  data-min="7"  data-max="7" >+297  Aruba</option>
              <option value="+61"   data-min="9"  data-max="9" >+61   Australia</option>
              <option value="+43"   data-min="10" data-max="11">+43   Austria</option>
              <option value="+994"  data-min="9"  data-max="9" >+994  Azerbaijan</option>
              <option value="+1242" data-min="7"  data-max="7" >+1242 Bahamas</option>
              <option value="+973"  data-min="8"  data-max="8" >+973  Bahrain</option>
              <option value="+880"  data-min="10" data-max="10">+880  Bangladesh</option>
              <option value="+1246" data-min="7"  data-max="7" >+1246 Barbados</option>
              <option value="+375"  data-min="9"  data-max="9" >+375  Belarus</option>
              <option value="+32"   data-min="9"  data-max="9" >+32   Belgium</option>
              <option value="+501"  data-min="7"  data-max="7" >+501  Belize</option>
              <option value="+229"  data-min="8"  data-max="8" >+229  Benin</option>
              <option value="+1441" data-min="7"  data-max="7" >+1441 Bermuda</option>
              <option value="+975"  data-min="8"  data-max="8" >+975  Bhutan</option>
              <option value="+591"  data-min="8"  data-max="8" >+591  Bolivia</option>
              <option value="+387"  data-min="8"  data-max="8" >+387  Bosnia</option>
              <option value="+267"  data-min="8"  data-max="8" >+267  Botswana</option>
              <option value="+55"   data-min="10" data-max="11">+55   Brazil</option>
              <option value="+673"  data-min="7"  data-max="7" >+673  Brunei</option>
              <option value="+359"  data-min="9"  data-max="9" >+359  Bulgaria</option>
              <option value="+226"  data-min="8"  data-max="8" >+226  Burkina Faso</option>
              <option value="+257"  data-min="8"  data-max="8" >+257  Burundi</option>
              <option value="+855"  data-min="8"  data-max="9" >+855  Cambodia</option>
              <option value="+237"  data-min="9"  data-max="9" >+237  Cameroon</option>
              <option value="+1"    data-min="10" data-max="10">+1    Canada</option>
              <option value="+238"  data-min="7"  data-max="7" >+238  Cape Verde</option>
              <option value="+1345" data-min="7"  data-max="7" >+1345 Cayman Islands</option>
              <option value="+236"  data-min="8"  data-max="8" >+236  C. African Rep.</option>
              <option value="+235"  data-min="8"  data-max="8" >+235  Chad</option>
              <option value="+56"   data-min="9"  data-max="9" >+56   Chile</option>
              <option value="+86"   data-min="11" data-max="11">+86   China</option>
              <option value="+57"   data-min="10" data-max="10">+57   Colombia</option>
              <option value="+269"  data-min="7"  data-max="7" >+269  Comoros</option>
              <option value="+242"  data-min="9"  data-max="9" >+242  Congo</option>
              <option value="+243"  data-min="9"  data-max="9" >+243  Congo (DRC)</option>
              <option value="+506"  data-min="8"  data-max="8" >+506  Costa Rica</option>
              <option value="+385"  data-min="9"  data-max="9" >+385  Croatia</option>
              <option value="+53"   data-min="8"  data-max="8" >+53   Cuba</option>
              <option value="+357"  data-min="8"  data-max="8" >+357  Cyprus</option>
              <option value="+420"  data-min="9"  data-max="9" >+420  Czech Republic</option>
              <option value="+45"   data-min="8"  data-max="8" >+45   Denmark</option>
              <option value="+253"  data-min="8"  data-max="8" >+253  Djibouti</option>
              <option value="+1767" data-min="7"  data-max="7" >+1767 Dominica</option>
              <option value="+1809" data-min="7"  data-max="7" >+1809 Dominican Rep.</option>
              <option value="+593"  data-min="9"  data-max="9" >+593  Ecuador</option>
              <option value="+20"   data-min="10" data-max="10">+20   Egypt</option>
              <option value="+503"  data-min="8"  data-max="8" >+503  El Salvador</option>
              <option value="+240"  data-min="9"  data-max="9" >+240  Equatorial Guinea</option>
              <option value="+291"  data-min="7"  data-max="7" >+291  Eritrea</option>
              <option value="+372"  data-min="7"  data-max="8" >+372  Estonia</option>
              <option value="+268"  data-min="8"  data-max="8" >+268  Eswatini</option>
              <option value="+251"  data-min="9"  data-max="9" >+251  Ethiopia</option>
              <option value="+679"  data-min="7"  data-max="7" >+679  Fiji</option>
              <option value="+358"  data-min="9"  data-max="10">+358  Finland</option>
              <option value="+33"   data-min="9"  data-max="9" >+33   France</option>
              <option value="+241"  data-min="8"  data-max="8" >+241  Gabon</option>
              <option value="+220"  data-min="7"  data-max="7" >+220  Gambia</option>
              <option value="+995"  data-min="9"  data-max="9" >+995  Georgia</option>
              <option value="+49"   data-min="10" data-max="11">+49   Germany</option>
              <option value="+233"  data-min="9"  data-max="9" >+233  Ghana</option>
              <option value="+350"  data-min="8"  data-max="8" >+350  Gibraltar</option>
              <option value="+30"   data-min="10" data-max="10">+30   Greece</option>
              <option value="+299"  data-min="6"  data-max="6" >+299  Greenland</option>
              <option value="+1473" data-min="7"  data-max="7" >+1473 Grenada</option>
              <option value="+502"  data-min="8"  data-max="8" >+502  Guatemala</option>
              <option value="+224"  data-min="9"  data-max="9" >+224  Guinea</option>
              <option value="+245"  data-min="7"  data-max="7" >+245  Guinea-Bissau</option>
              <option value="+592"  data-min="7"  data-max="7" >+592  Guyana</option>
              <option value="+509"  data-min="8"  data-max="8" >+509  Haiti</option>
              <option value="+504"  data-min="8"  data-max="8" >+504  Honduras</option>
              <option value="+852"  data-min="8"  data-max="8" >+852  Hong Kong</option>
              <option value="+36"   data-min="9"  data-max="9" >+36   Hungary</option>
              <option value="+354"  data-min="7"  data-max="7" >+354  Iceland</option>
              <option value="+91"   data-min="10" data-max="10">+91   India</option>
              <option value="+62"   data-min="9"  data-max="12">+62   Indonesia</option>
              <option value="+98"   data-min="10" data-max="10">+98   Iran</option>
              <option value="+964"  data-min="10" data-max="10">+964  Iraq</option>
              <option value="+353"  data-min="9"  data-max="9" >+353  Ireland</option>
              <option value="+972"  data-min="9"  data-max="9" >+972  Israel</option>
              <option value="+39"   data-min="9"  data-max="10">+39   Italy</option>
              <option value="+225"  data-min="10" data-max="10">+225  Ivory Coast</option>
              <option value="+1876" data-min="7"  data-max="7" >+1876 Jamaica</option>
              <option value="+81"   data-min="10" data-max="11">+81   Japan</option>
              <option value="+962"  data-min="9"  data-max="9" >+962  Jordan</option>
              <option value="+7"    data-min="10" data-max="10">+7    Kazakhstan</option>
              <option value="+254"  data-min="10" data-max="10">+254  Kenya</option>
              <option value="+686"  data-min="5"  data-max="8" >+686  Kiribati</option>
              <option value="+965"  data-min="8"  data-max="8" >+965  Kuwait</option>
              <option value="+996"  data-min="9"  data-max="9" >+996  Kyrgyzstan</option>
              <option value="+856"  data-min="8"  data-max="9" >+856  Laos</option>
              <option value="+371"  data-min="8"  data-max="8" >+371  Latvia</option>
              <option value="+961"  data-min="7"  data-max="8" >+961  Lebanon</option>
              <option value="+266"  data-min="8"  data-max="8" >+266  Lesotho</option>
              <option value="+231"  data-min="8"  data-max="8" >+231  Liberia</option>
              <option value="+218"  data-min="9"  data-max="9" >+218  Libya</option>
              <option value="+423"  data-min="7"  data-max="7" >+423  Liechtenstein</option>
              <option value="+370"  data-min="8"  data-max="8" >+370  Lithuania</option>
              <option value="+352"  data-min="9"  data-max="9" >+352  Luxembourg</option>
              <option value="+853"  data-min="8"  data-max="8" >+853  Macau</option>
              <option value="+261"  data-min="9"  data-max="9" >+261  Madagascar</option>
              <option value="+265"  data-min="9"  data-max="9" >+265  Malawi</option>
              <option value="+60"   data-min="9"  data-max="10">+60   Malaysia</option>
              <option value="+960"  data-min="7"  data-max="7" >+960  Maldives</option>
              <option value="+223"  data-min="8"  data-max="8" >+223  Mali</option>
              <option value="+356"  data-min="8"  data-max="8" >+356  Malta</option>
              <option value="+222"  data-min="8"  data-max="8" >+222  Mauritania</option>
              <option value="+230"  data-min="8"  data-max="8" >+230  Mauritius</option>
              <option value="+52"   data-min="10" data-max="10">+52   Mexico</option>
              <option value="+373"  data-min="8"  data-max="8" >+373  Moldova</option>
              <option value="+377"  data-min="8"  data-max="9" >+377  Monaco</option>
              <option value="+976"  data-min="8"  data-max="8" >+976  Mongolia</option>
              <option value="+382"  data-min="8"  data-max="8" >+382  Montenegro</option>
              <option value="+1664" data-min="7"  data-max="7" >+1664 Montserrat</option>
              <option value="+212"  data-min="9"  data-max="9" >+212  Morocco</option>
              <option value="+258"  data-min="9"  data-max="9" >+258  Mozambique</option>
              <option value="+95"   data-min="8"  data-max="9" >+95   Myanmar</option>
              <option value="+264"  data-min="9"  data-max="9" >+264  Namibia</option>
              <option value="+977"  data-min="10" data-max="10">+977  Nepal</option>
              <option value="+31"   data-min="9"  data-max="9" >+31   Netherlands</option>
              <option value="+64"   data-min="8"  data-max="9" >+64   New Zealand</option>
              <option value="+505"  data-min="8"  data-max="8" >+505  Nicaragua</option>
              <option value="+227"  data-min="8"  data-max="8" >+227  Niger</option>
              <option value="+234"  data-min="10" data-max="10">+234  Nigeria</option>
              <option value="+850"  data-min="8"  data-max="8" >+850  North Korea</option>
              <option value="+389"  data-min="8"  data-max="8" >+389  North Macedonia</option>
              <option value="+47"   data-min="8"  data-max="8" >+47   Norway</option>
              <option value="+968"  data-min="8"  data-max="8" >+968  Oman</option>
              <option value="+92"   data-min="10" data-max="10">+92   Pakistan</option>
              <option value="+680"  data-min="7"  data-max="7" >+680  Palau</option>
              <option value="+970"  data-min="9"  data-max="9" >+970  Palestine</option>
              <option value="+507"  data-min="8"  data-max="8" >+507  Panama</option>
              <option value="+675"  data-min="8"  data-max="8" >+675  Papua New Guinea</option>
              <option value="+595"  data-min="9"  data-max="9" >+595  Paraguay</option>
              <option value="+51"   data-min="9"  data-max="9" >+51   Peru</option>
              <option value="+63"   data-min="10" data-max="10">+63   Philippines</option>
              <option value="+48"   data-min="9"  data-max="9" >+48   Poland</option>
              <option value="+351"  data-min="9"  data-max="9" >+351  Portugal</option>
              <option value="+1787" data-min="7"  data-max="7" >+1787 Puerto Rico</option>
              <option value="+974"  data-min="8"  data-max="8" >+974  Qatar</option>
              <option value="+40"   data-min="9"  data-max="9" >+40   Romania</option>
              <option value="+7"    data-min="10" data-max="10">+7    Russia</option>
              <option value="+250"  data-min="9"  data-max="9" >+250  Rwanda</option>
              <option value="+1869" data-min="7"  data-max="7" >+1869 St. Kitts &amp; Nevis</option>
              <option value="+1758" data-min="7"  data-max="7" >+1758 St. Lucia</option>
              <option value="+1784" data-min="7"  data-max="7" >+1784 St. Vincent</option>
              <option value="+685"  data-min="7"  data-max="7" >+685  Samoa</option>
              <option value="+239"  data-min="7"  data-max="7" >+239  São Tomé</option>
              <option value="+966"  data-min="9"  data-max="9" >+966  Saudi Arabia</option>
              <option value="+221"  data-min="9"  data-max="9" >+221  Senegal</option>
              <option value="+381"  data-min="9"  data-max="9" >+381  Serbia</option>
              <option value="+248"  data-min="7"  data-max="7" >+248  Seychelles</option>
              <option value="+232"  data-min="8"  data-max="8" >+232  Sierra Leone</option>
              <option value="+65"   data-min="8"  data-max="8" >+65   Singapore</option>
              <option value="+421"  data-min="9"  data-max="9" >+421  Slovakia</option>
              <option value="+386"  data-min="8"  data-max="8" >+386  Slovenia</option>
              <option value="+677"  data-min="7"  data-max="7" >+677  Solomon Islands</option>
              <option value="+252"  data-min="8"  data-max="9" >+252  Somalia</option>
              <option value="+27"   data-min="9"  data-max="9" >+27   South Africa</option>
              <option value="+82"   data-min="9"  data-max="10">+82   South Korea</option>
              <option value="+211"  data-min="9"  data-max="9" >+211  South Sudan</option>
              <option value="+34"   data-min="9"  data-max="9" >+34   Spain</option>
              <option value="+94"   data-min="9"  data-max="9" >+94   Sri Lanka</option>
              <option value="+249"  data-min="9"  data-max="9" >+249  Sudan</option>
              <option value="+597"  data-min="7"  data-max="7" >+597  Suriname</option>
              <option value="+46"   data-min="9"  data-max="10">+46   Sweden</option>
              <option value="+41"   data-min="9"  data-max="9" >+41   Switzerland</option>
              <option value="+963"  data-min="9"  data-max="9" >+963  Syria</option>
              <option value="+886"  data-min="9"  data-max="9" >+886  Taiwan</option>
              <option value="+992"  data-min="9"  data-max="9" >+992  Tajikistan</option>
              <option value="+255"  data-min="9"  data-max="9" >+255  Tanzania</option>
              <option value="+66"   data-min="9"  data-max="9" >+66   Thailand</option>
              <option value="+670"  data-min="8"  data-max="8" >+670  Timor-Leste</option>
              <option value="+228"  data-min="8"  data-max="8" >+228  Togo</option>
              <option value="+676"  data-min="7"  data-max="7" >+676  Tonga</option>
              <option value="+1868" data-min="7"  data-max="7" >+1868 Trinidad &amp; Tobago</option>
              <option value="+216"  data-min="8"  data-max="8" >+216  Tunisia</option>
              <option value="+90"   data-min="10" data-max="10">+90   Turkey</option>
              <option value="+993"  data-min="8"  data-max="8" >+993  Turkmenistan</option>
              <option value="+1649" data-min="7"  data-max="7" >+1649 Turks &amp; Caicos</option>
              <option value="+256"  data-min="9"  data-max="9" >+256  Uganda</option>
              <option value="+380"  data-min="9"  data-max="9" >+380  Ukraine</option>
              <option value="+971"  data-min="9"  data-max="9" >+971  UAE</option>
              <option value="+44"   data-min="10" data-max="10">+44   United Kingdom</option>
              <option value="+598"  data-min="8"  data-max="8" >+598  Uruguay</option>
              <option value="+1"    data-min="10" data-max="10">+1    USA</option>
              <option value="+998"  data-min="9"  data-max="9" >+998  Uzbekistan</option>
              <option value="+678"  data-min="7"  data-max="7" >+678  Vanuatu</option>
              <option value="+58"   data-min="10" data-max="10">+58   Venezuela</option>
              <option value="+84"   data-min="9"  data-max="10">+84   Vietnam</option>
              <option value="+967"  data-min="9"  data-max="9" >+967  Yemen</option>
              <option value="+260"  data-min="9"  data-max="9" >+260  Zambia</option>
              <option value="+263"  data-min="9"  data-max="9" >+263  Zimbabwe</option>
            </select>
            <input type="text" id="slide-nc-phone-num" inputmode="numeric" placeholder="Phone number"
                   style="border-radius:0 4px 4px 0;flex:1;min-width:0;"
                   oninput="this.value=this.value.replace(/[^0-9]/g,'');document.getElementById('slide-nc-phone-err').style.display='none';" />
          </div>
          <div id="slide-nc-phone-err" style="color:#c00;font-size:11px;margin-top:4px;display:none;"></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Location</label><input type="text" id="slide-nc-location" placeholder="San Francisco, CA" /></div>
          <div class="field"><label>LinkedIn URL</label><input type="text" id="slide-nc-linkedin" placeholder="linkedin.com/in/sarahchen" /></div>
        </div>
        <h4>Tags &amp; ownership</h4>
        <div class="field-row">
          <div class="field"><label>Owner</label><select><option>Mayur S.</option><option>Sarah K.</option></select></div>
          <div class="field"><label>Source</label><select id="slide-nc-source"><option value="manual">Manual</option><option value="linkedin">LinkedIn</option><option value="gmail_sync">Email sync</option><option value="csv_import">CSV import</option></select></div>
        </div>
        <div class="field">
          <label>Tags</label>
          <div id="slide-nc-tags-chips" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;min-height:0;"></div>
          <input type="text" id="slide-nc-tags-input" placeholder="Type a tag and press Enter to add" autocomplete="off" />
          <div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px;align-items:center;">
            <span class="label" style="margin-right:2px;">Suggested:</span>
            <span class="chip tag-suggest" data-tag="Enterprise" style="cursor:pointer;">Enterprise</span>
            <span class="chip tag-suggest" data-tag="SMB" style="cursor:pointer;">SMB</span>
            <span class="chip tag-suggest" data-tag="SaaS" style="cursor:pointer;">SaaS</span>
            <span class="chip tag-suggest" data-tag="Decision Maker" style="cursor:pointer;">Decision Maker</span>
            <span class="chip tag-suggest" data-tag="Champion" style="cursor:pointer;">Champion</span>
          </div>
        </div>
      `,
      primaryLabel: "Create contact",
      note: "Visible to all roles with Person read",
      onSave: () => {
        const firstName = (document.getElementById("slide-nc-firstname")?.value || "").trim();
        const lastName = (document.getElementById("slide-nc-lastname")?.value || "").trim();
        const email = (document.getElementById("slide-nc-email")?.value || "").trim();
        const title = (document.getElementById("slide-nc-title")?.value || "").trim();
        const location = (document.getElementById("slide-nc-location")?.value || "").trim();
        const linkedinUrl = (document.getElementById("slide-nc-linkedin")?.value || "").trim();
        const source = document.getElementById("slide-nc-source")?.value || "manual";

        // Phone validation
        const ccEl = document.getElementById("slide-nc-phone-cc");
        const phoneNum = (document.getElementById("slide-nc-phone-num")?.value || "").trim();
        const phoneErrEl = document.getElementById("slide-nc-phone-err");
        if (phoneNum) {
          const opt = ccEl?.options[ccEl.selectedIndex];
          const min = parseInt(opt?.dataset.min || "0");
          const max = parseInt(opt?.dataset.max || "99");
          if (!/^[0-9]+$/.test(phoneNum)) {
            phoneErrEl.textContent = "Only digits are allowed.";
            phoneErrEl.style.display = "block";
            return false;
          }
          if (phoneNum.length < min || phoneNum.length > max) {
            phoneErrEl.textContent = ccEl.value + " numbers must be " + (min === max ? min : min + "–" + max) + " digits (entered: " + phoneNum.length + ").";
            phoneErrEl.style.display = "block";
            return false;
          }
        }
        const phone = phoneNum ? (ccEl?.value || "") + phoneNum : "";

        if (firstName && lastName && window.SS_API) {
          const payload = { firstName, lastName, source };
          if (email) payload.email = email;
          if (title) payload.title = title;
          if (phone) payload.phone = phone;
          if (location) payload.location = location;
          if (linkedinUrl) payload.linkedinUrl = linkedinUrl;
          window.SS_API.Contacts.create(payload)
            .then(() => {
              toast("Contact created", { sub: firstName + " " + lastName + " added" });
              if (typeof window.SS_loadContacts === "function") window.SS_loadContacts();
            })
            .catch((err) => toast("Contact created", { sub: "Person added" }));
        } else {
          toast("Contact created", { sub: "Person added" });
        }
      },
    }),

    "new-company": () => ({
      eyebrow: "M1 · F1.1 · New Company",
      title: "Add a new company",
      body: `
        <div class="field"><label>Company name<span class="field-required-marker">*</span></label><input type="text" id="slide-co-name" placeholder="Acme Corp" /></div>
        <div class="field"><label>Website / domain</label><input type="text" id="slide-co-domain" placeholder="acme.com" /></div>
        <div class="field-row">
          <div class="field"><label>Industry</label>
            <select id="slide-co-industry"><option value="">—</option><option value="SaaS">SaaS</option><option value="Fintech">Fintech</option><option value="Logistics">Logistics</option><option value="Healthcare">Healthcare</option><option value="Retail">Retail</option><option value="Other">Other</option></select>
          </div>
          <div class="field"><label>Size (employees)</label>
            <input type="number" id="slide-co-size" placeholder="500" />
          </div>
        </div>
        <div class="field"><label>HQ location</label><input type="text" id="slide-co-hq" placeholder="San Francisco, US" /></div>
        <h4>Ownership</h4>
        <div class="field"><label>Owner</label><select><option>Mayur S.</option><option>Sarah K.</option></select></div>
        <div class="field"><label>Tags</label><input type="text" placeholder="e.g. Enterprise, Strategic" /></div>
      `,
      primaryLabel: "Create company",
      note: "Auto-enrichment will populate logo + size · F1.4",
      onSave: () => {
        const name = (document.getElementById("slide-co-name")?.value || "").trim();
        const domain = (document.getElementById("slide-co-domain")?.value || "").trim();
        const industry = (document.getElementById("slide-co-industry")?.value || "").trim();
        const size = document.getElementById("slide-co-size")?.value;
        const hq = (document.getElementById("slide-co-hq")?.value || "").trim();
        if (name && window.SS_API) {
          const payload = { name };
          if (domain) payload.domain = domain;
          if (industry) payload.industry = industry;
          if (size) payload.size = Number(size);
          if (hq) payload.hq = hq;
          window.SS_API.Companies.create(payload)
            .then(() => {
              toast("Company created", { sub: name + " added · Enrichment queued" });
              if (typeof window.SS_loadCompanies === "function") window.SS_loadCompanies();
            })
            .catch((err) => toast(err.message || "Could not create company", { sub: "Check the name and try again" }));
        } else {
          toast("Company created", { sub: "Enrichment queued" });
        }
      },
    }),

    "new-deal": (ctx) => ({
      eyebrow: "M2 · F2.1 · F2.2 · New Deal",
      title: "Add a new deal",
      body: `
        <div class="field"><label>Deal name<span class="field-required-marker">*</span></label><input type="text" id="slide-nd-name" placeholder="Acme — Annual License" /></div>
        <div class="field"><label>Company</label><input type="text" id="slide-nd-company" value="${ctx && ctx.company ? ctx.company : ''}" placeholder="Acme Corp" /></div>
        <div class="field-row">
          <div class="field"><label>Pipeline</label>
            <select id="slide-nd-pipeline"><option value="direct_sales">Direct Sales</option><option value="channel_partners">Channel Partner Deals</option><option value="expansion">Expansion (renewals)</option></select>
          </div>
          <div class="field"><label>Stage</label>
            <select id="slide-nd-stage"><option value="Discovery" selected>Discovery</option><option value="Qualified">Qualified</option><option value="Proposal">Proposal</option><option value="Negotiation">Negotiation</option><option value="Closed Won">Closed Won</option><option value="Closed Lost">Closed Lost</option></select>
          </div>
        </div>
        <div class="field-row">
          <div class="field"><label>Amount<span class="field-required-marker">*</span></label><input type="number" id="slide-nd-amount" placeholder="48000" /></div>
          <div class="field"><label>Close date</label><input type="date" id="slide-nd-closedate" /></div>
        </div>
        <h4>Custom fields (F2.3)</h4>
        <div class="field-row">
          <div class="field"><label>Competitor</label>
            <select id="slide-nd-competitor"><option value="">None</option><option value="HubSpot">HubSpot</option><option value="Salesforce">Salesforce</option><option value="Pipedrive">Pipedrive</option></select>
          </div>
          <div class="field"><label>Source</label>
            <select id="slide-nd-source"><option value="LinkedIn outbound">LinkedIn outbound</option><option value="Inbound">Inbound</option><option value="Channel">Channel</option><option value="Referral">Referral</option></select>
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
      onSave: () => {
        const name = (document.getElementById("slide-nd-name")?.value || "").trim();
        const amount = document.getElementById("slide-nd-amount")?.value;
        const stage = document.getElementById("slide-nd-stage")?.value || "Discovery";
        const pipeline = document.getElementById("slide-nd-pipeline")?.value || "direct_sales";
        const closeDate = document.getElementById("slide-nd-closedate")?.value;
        const competitor = document.getElementById("slide-nd-competitor")?.value || "";
        const source = document.getElementById("slide-nd-source")?.value || "";

        // G16 — Stage-gate: enforce required fields before advancing stages
        const STAGE_GATE = ["Discovery","Qualified","Proposal","Negotiation","Closed Won","Closed Lost"];
        const stageIdx = STAGE_GATE.indexOf(stage);
        if (stageIdx >= 2 && !competitor) {
          toast("Stage-gate: Competitor required", { sub: "Set Competitor before advancing to Proposal or beyond" });
          return false;
        }
        if (stageIdx >= 3 && !closeDate) {
          toast("Stage-gate: Close date required", { sub: "Set Close date before advancing to Negotiation or beyond" });
          return false;
        }

        if (name && amount && window.SS_API) {
          const payload = { name, amount: Number(amount), stage, pipeline };
          if (closeDate) payload.closeDate = closeDate;
          if (competitor) payload.competitor = competitor;
          if (source) payload.source = source;
          window.SS_API.Deals.create(payload)
            .then(() => {
              toast("Deal created", { sub: name + " added to " + stage });
              if (typeof window.SS_loadDeals === "function") window.SS_loadDeals();
            })
            .catch((err) => toast(err.message || "Could not create deal", { sub: "Check required fields and try again" }));
        } else {
          toast("Deal created", { sub: "Added to Direct Sales · Discovery" });
        }
      },
    }),

    "new-task": (ctx) => ({
      eyebrow: "M3 · F3.1 · New Task",
      title: "Add a new task",
      body: `
        <div class="field"><label>Title</label><input type="text" id="slide-nt-title" placeholder="Follow up on pricing question" /></div>
        <div class="field-row">
          <div class="field"><label>Due date</label><input type="date" id="slide-nt-due" /></div>
          <div class="field"><label>Priority</label><select id="slide-nt-priority"><option value="high">High</option><option value="med" selected>Medium</option><option value="low">Low</option></select></div>
        </div>
        <div class="field"><label>Linked to</label>
          <select id="slide-nt-linked">
            <option value="">— None —</option>
            <optgroup label="Deals">
              <option value="deal:acme-annual">Acme — Annual License</option>
              <option value="deal:northwind-multi">Northwind — Multi-year</option>
              <option value="deal:globex-annual">Globex Inc — Annual</option>
              <option value="deal:hooli-multi">Hooli — Multi-year</option>
              <option value="deal:vellichor">Vellichor Ltd — Annual</option>
            </optgroup>
            <optgroup label="Contacts">
              <option value="contact:sarah-chen">Sarah Chen · VP Sales, Acme</option>
              <option value="contact:ellen-lee">Ellen Lee · Director, IT</option>
              <option value="contact:carlos-mendes">Carlos Mendes · VP Finance</option>
              <option value="contact:priya-n">Priya N. · Procurement Lead</option>
            </optgroup>
            <optgroup label="Companies">
              <option value="company:acme">Acme Corp</option>
              <option value="company:northwind">Northwind Corp</option>
              <option value="company:globex">Globex Inc.</option>
              <option value="company:hooli">Hooli</option>
              <option value="company:initech">Initech</option>
            </optgroup>
          </select>
        </div>
        <div class="field"><label>Description</label><textarea placeholder="Optional notes"></textarea></div>
        <div class="checkbox-line"><input type="checkbox" /> <span>Set a reminder 15 minutes before due time</span></div>
        <div class="checkbox-line"><input type="checkbox" /> <span>Repeat weekly</span></div>
      `,
      primaryLabel: "Create task",
      note: "Reminder will appear as a browser notification",
      onSave: () => {
        const title = (document.getElementById("slide-nt-title")?.value || "").trim();
        const due = document.getElementById("slide-nt-due")?.value;
        const priority = document.getElementById("slide-nt-priority")?.value || "med";
        if (title && window.SS_API) {
          const payload = { title, priority };
          if (due) payload.dueAt = new Date(due).toISOString();
          window.SS_API.Tasks.create(payload)
            .then(() => {
              toast("Task created", { sub: "Visible in My Day and Tasks" });
              if (typeof window.SS_loadTasks === "function") window.SS_loadTasks();
            })
            .catch(() => toast("Task created", { sub: "Visible in My Day and Tasks" }));
        } else {
          toast("Task created", { sub: "Visible in My Day and Tasks" });
        }
      },
    }),

    "new-activity": () => ({
      eyebrow: "M3 · F3.2 · Log Activity",
      title: "Log an activity",
      body: `
        <div class="field-row">
          <div class="field"><label>Activity type</label>
            <select id="slide-la-type"><option value="meeting">Meeting</option><option value="call">Call</option><option value="email">Email</option><option value="note">Note</option></select>
          </div>
          <div class="field"><label>Date &amp; time</label><input type="datetime-local" id="slide-la-date" /></div>
        </div>
        <div class="field"><label>Summary<span class="field-required-marker">*</span></label><input type="text" id="slide-la-title" placeholder="Discovery call with Sarah Chen" /></div>
        <div class="field"><label>Linked records</label><input type="text" placeholder="Contacts and / or deals" /></div>
        <div class="field"><label>Notes</label><textarea id="slide-la-body" placeholder="What was discussed? Outcomes? Next steps?"></textarea></div>
      `,
      primaryLabel: "Log activity",
      onSave: () => {
        const type = document.getElementById("slide-la-type")?.value || "meeting";
        const title = (document.getElementById("slide-la-title")?.value || "").trim();
        const body = (document.getElementById("slide-la-body")?.value || "").trim();
        const date = document.getElementById("slide-la-date")?.value;
        if (title && window.SS_API) {
          const payload = {
            type,
            title,
            occurredAt: date ? new Date(date).toISOString() : new Date().toISOString(),
          };
          if (body) payload.body = body;
          window.SS_API.Activities.create(payload)
            .then(() => {
              toast("Activity logged", { sub: title + " added to timeline" });
              if (typeof window.SS_loadActivities === "function") window.SS_loadActivities();
            })
            .catch(() => toast("Activity logged", { sub: "Added to timeline" }));
        } else {
          toast("Activity logged", { sub: "Added to timeline" });
        }
      },
    }),

    "new-pipeline": () => {
      window.__npAddStage = function() {
        var container = document.getElementById('np-stages');
        if (!container) return;
        var idx = container.querySelectorAll('.np-stage-row').length + 1;
        var row = document.createElement('div');
        row.className = 'field-row np-stage-row';
        row.style.alignItems = 'flex-end';
        row.innerHTML =
          '<div class="field" style="flex:3;"><input type="text" placeholder="Stage ' + idx + '" /></div>' +
          '<div class="field" style="flex:1;"><input type="text" placeholder="0%" /></div>' +
          '<button type="button" class="btn sm" style="margin-bottom:4px;" ' +
            'onclick="this.closest(\'.np-stage-row\').remove()">×</button>';
        container.appendChild(row);
      };

      return {
        eyebrow: "M2 · F2.1 · New Pipeline",
        title: "Add a new pipeline",
        body:
          '<div class="field"><label>Pipeline name<span class="field-required-marker">*</span></label>' +
            '<input id="np-name" type="text" placeholder="Channel Partner Deals" /></div>' +
          '<div class="field"><label>Description</label>' +
            '<input id="np-desc" type="text" placeholder="Used for indirect deals through resellers" /></div>' +
          '<h4 style="margin:12px 0 8px;">Stages</h4>' +
          '<div id="np-stages">' +
            '<div class="field-row np-stage-row">' +
              '<div class="field" style="flex:3;"><label>Stage name</label><input type="text" value="Identified" /></div>' +
              '<div class="field" style="flex:1;"><label>Win %</label><input type="text" value="10%" /></div>' +
            '</div>' +
            '<div class="field-row np-stage-row">' +
              '<div class="field" style="flex:3;"><input type="text" value="Qualified" /></div>' +
              '<div class="field" style="flex:1;"><input type="text" value="30%" /></div>' +
            '</div>' +
            '<div class="field-row np-stage-row">' +
              '<div class="field" style="flex:3;"><input type="text" value="Co-sell" /></div>' +
              '<div class="field" style="flex:1;"><input type="text" value="60%" /></div>' +
            '</div>' +
            '<div class="field-row np-stage-row">' +
              '<div class="field" style="flex:3;"><input type="text" value="Signed" /></div>' +
              '<div class="field" style="flex:1;"><input type="text" value="85%" /></div>' +
            '</div>' +
          '</div>' +
          '<button type="button" class="btn sm" onclick="window.__npAddStage()" style="margin-top:6px;">+ Add stage</button>' +
          '<h4 style="margin:12px 0 8px;">Visibility</h4>' +
          '<div class="field"><label>Visible to roles</label>' +
            '<select id="np-vis"><option>All roles</option><option>Channel team only</option><option>Sales Rep, Sales Manager</option><option>CS Manager, Sales Manager</option></select>' +
          '</div>',
        primaryLabel: "Create pipeline",
        note: "RBAC respects visibility · F9.1",
        onSave: () => {
          var nameEl = document.getElementById('np-name');
          var descEl = document.getElementById('np-desc');
          var visEl  = document.getElementById('np-vis');
          var name   = nameEl && nameEl.value.trim();
          if (!name) { toast("Pipeline name is required", { sub: "Enter a name and try again" }); return; }

          var desc   = descEl ? descEl.value.trim() : '';
          var vis    = visEl  ? visEl.value : 'All roles';

          // Collect stages from rows
          var stages = [];
          document.querySelectorAll('#np-stages .np-stage-row').forEach(function(row) {
            var inputs = row.querySelectorAll('input[type=text]');
            var stageName = inputs[0] ? inputs[0].value.trim() : '';
            var prob      = inputs[1] ? inputs[1].value.trim() : '—';
            if (stageName) stages.push({ name: stageName, prob: prob });
          });

          var stageCount = stages.length;
          var stageNames = stages.map(function(s) { return s.name; }).join(' · ') || '—';

          // Build stage table rows
          var stageRows = stages.map(function(s, i) {
            return '<tr><td>' + (i + 1) + '</td><td><strong>' + s.name + '</strong></td>' +
              '<td class="num">' + s.prob + '</td><td>0</td><td class="num">—</td><td>—</td></tr>';
          }).join('');

          // Build and inject new pipeline card
          var cardHtml =
            '<div class="card mb-5">' +
              '<div class="card-head"><div>' +
                '<div class="card-title">' + name + '</div>' +
                '<div class="card-sub">' + stageCount + ' stages · 0 open deals · Visible to: ' + vis + '</div>' +
              '</div>' +
              '<div class="row gap-2"><button class="btn sm">Settings</button></div></div>' +
              (desc ? '<div class="text-muted mt-2" style="font-size:12px;">' + desc + '</div>' : '') +
              '<table class="table mt-3"><thead><tr>' +
                '<th style="width:24px;"></th><th>Stage</th><th>Probability</th>' +
                '<th>Open deals</th><th class="num">Value</th><th>Required fields</th>' +
              '</tr></thead><tbody>' + stageRows + '</tbody></table>' +
            '</div>';

          var allCards = document.querySelectorAll('.card.mb-5');
          var anchor   = allCards[allCards.length - 1];
          if (anchor) {
            anchor.insertAdjacentHTML('afterend', cardHtml);
          } else {
            var content = document.querySelector('.content');
            if (content) content.insertAdjacentHTML('beforeend', cardHtml);
          }

          // Update page subtitle
          var pageSub = document.querySelector('.page-sub');
          if (pageSub) {
            var total = document.querySelectorAll('.card.mb-5').length;
            pageSub.textContent = total + ' pipelines · Each with its own stages, probabilities, and role-scoped visibility';
          }

          toast("Pipeline created", { sub: name + ' · ' + stageCount + ' stages added' });
        },
      };
    },

    "pipeline-settings": (ctx) => {
      ctx = ctx || {};
      var pName       = ctx.name       || "Pipeline";
      var pStages     = ctx.stages     || [];
      var pVisibility = ctx.visibility || "All roles";
      var cardEl      = ctx.cardEl     || null;

      window.__psAddStage = function() {
        var container = document.getElementById("ps-stages");
        if (!container) return;
        var idx = container.querySelectorAll(".ps-stage-row").length + 1;
        var row = document.createElement("div");
        row.className = "field-row ps-stage-row";
        row.style.alignItems = "flex-end";
        row.innerHTML =
          '<div class="field" style="flex:3;"><input type="text" placeholder="Stage ' + idx + '" /></div>' +
          '<div class="field" style="flex:1;"><input type="text" placeholder="0%" /></div>' +
          '<button type="button" class="btn sm" style="margin-bottom:4px;" ' +
            'onclick="this.closest(\'.ps-stage-row\').remove()">×</button>';
        container.appendChild(row);
      };

      window.__psDelete = function() {
        if (!cardEl) { toast("Pipeline not found"); return; }
        if (!confirm('Delete "' + pName + '"? This cannot be undone.')) return;
        cardEl.remove();
        var pageSub = document.querySelector(".page-sub");
        if (pageSub) {
          var total = document.querySelectorAll(".card.mb-5").length;
          pageSub.textContent = total + " pipelines · Each with its own stages, probabilities, and role-scoped visibility";
        }
        if (window.SS_closeSlide) window.SS_closeSlide();
        toast("Pipeline deleted", { sub: '"' + pName + '" has been removed' });
      };

      var visOpts = ["All roles", "Channel team only", "Sales Rep, Sales Manager", "CS Manager, Sales Manager"];
      var stageRowsHtml = pStages.map(function(s) {
        return '<div class="field-row ps-stage-row" style="align-items:flex-end;">' +
          '<div class="field" style="flex:3;"><input type="text" value="' + s.name.replace(/"/g, "&quot;") + '" /></div>' +
          '<div class="field" style="flex:1;"><input type="text" value="' + s.prob.replace(/"/g, "&quot;") + '" /></div>' +
          '<button type="button" class="btn sm" style="margin-bottom:4px;" ' +
            'onclick="this.closest(\'.ps-stage-row\').remove()">×</button>' +
          '</div>';
      }).join("");

      // Detect if this pipeline already has the DEFAULT badge
      var isDefault = !!(cardEl && cardEl.querySelector('.badge.solid'));

      return {
        eyebrow: "M2 · F2.1 · Pipeline Settings",
        title: pName,
        body:
          '<div class="field"><label>Pipeline name</label>' +
            '<input id="ps-name" type="text" value="' + pName.replace(/"/g, "&quot;") + '" /></div>' +
          '<h4 style="margin:12px 0 8px;">Stages</h4>' +
          '<div id="ps-stages">' + stageRowsHtml + '</div>' +
          '<button type="button" class="btn sm" onclick="window.__psAddStage()" style="margin-top:6px;">+ Add stage</button>' +
          '<h4 style="margin:12px 0 8px;">Visibility</h4>' +
          '<div class="field"><label>Visible to roles</label><select id="ps-vis">' +
            visOpts.map(function(v) {
              return '<option' + (pVisibility.includes(v) || (v === "All roles" && pVisibility === "All roles") ? ' selected' : '') + '>' + v + '</option>';
            }).join("") +
          '</select></div>' +
          '<h4 style="margin:12px 0 8px;">Default</h4>' +
          '<div class="field" style="flex-direction:row;align-items:center;gap:10px;">' +
            '<input type="checkbox" id="ps-default"' + (isDefault ? ' checked' : '') + ' style="width:16px;height:16px;cursor:pointer;" />' +
            '<label for="ps-default" style="cursor:pointer;font-size:13px;">Set as default pipeline</label>' +
          '</div>' +
          (isDefault ? '<div class="text-muted" style="font-size:11px;margin-top:4px;">This is currently the default pipeline.</div>' : ''),
        primaryLabel: "Save changes",
        note: '<button type="button" class="btn" onclick="window.__psDelete()" style="border-color:var(--ink);color:var(--ink);">Delete pipeline</button>',
        onSave: () => {
          if (!cardEl) { toast("Pipeline updated"); return; }
          var nameEl = document.getElementById("ps-name");
          var visEl  = document.getElementById("ps-vis");
          var newName = (nameEl && nameEl.value.trim()) || pName;
          var newVis  = visEl ? visEl.value : pVisibility;

          var newStages = [];
          document.querySelectorAll("#ps-stages .ps-stage-row").forEach(function(row) {
            var inputs = row.querySelectorAll("input[type=text]");
            var sName = inputs[0] ? inputs[0].value.trim() : "";
            var sProb = inputs[1] ? inputs[1].value.trim() : "—";
            if (sName) newStages.push({ name: sName, prob: sProb });
          });

          // Update card title + subtitle
          var titleEl = cardEl.querySelector(".card-title");
          var subEl   = cardEl.querySelector(".card-sub");
          if (titleEl) titleEl.textContent = newName;
          if (subEl) {
            var dealMatch = subEl.textContent.match(/(\d+)\s+open deals/);
            var openDeals = dealMatch ? dealMatch[1] : "0";
            subEl.textContent = newStages.length + " stages · " + openDeals + " open deals · Visible to: " + newVis;
          }

          // Rebuild stage table if card has one
          var tbody = cardEl.querySelector("table tbody");
          if (tbody) {
            tbody.innerHTML = newStages.map(function(s, i) {
              return "<tr><td>" + (i + 1) + "</td><td><strong>" + s.name + "</strong></td>" +
                "<td class='num'>" + s.prob + "</td><td>0</td><td class='num'>—</td><td>—</td></tr>";
            }).join("");
          }

          // Update compact stage list if card uses text format
          var stagesSpan = Array.from(cardEl.querySelectorAll(".text-muted span"))
            .find(function(el) { return el.textContent.includes("Stages:"); });
          if (stagesSpan) {
            stagesSpan.innerHTML = "<strong>Stages:</strong> " +
              newStages.map(function(s) { return s.name; }).join(" · ");
          }

          // ── Handle default pipeline badge ────────────────────────────
          var defaultCb = document.getElementById("ps-default");
          if (defaultCb && defaultCb.checked) {
            // Remove DEFAULT badge from every pipeline card
            document.querySelectorAll(".card.mb-5 .badge.solid").forEach(function(b) {
              if (b.textContent.trim() === "DEFAULT") b.remove();
            });
            // Insert DEFAULT badge into this card's header button row (before Settings button)
            var cardHead = cardEl.querySelector(".card-head .row, .card-head div.row");
            if (!cardHead) cardHead = cardEl.querySelector(".card-head");
            if (cardHead) {
              var badge = document.createElement("span");
              badge.className = "badge solid";
              badge.textContent = "DEFAULT";
              cardHead.insertBefore(badge, cardHead.firstChild);
            }
          } else if (defaultCb && !defaultCb.checked && isDefault) {
            // User explicitly unchecked default — remove the badge
            var existing = cardEl.querySelector(".badge.solid");
            if (existing && existing.textContent.trim() === "DEFAULT") existing.remove();
          }

          toast("Pipeline updated", { sub: newName + " · " + newStages.length + " stages" });
        },
      };
    },

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

    "new-filter": () => {
      // ── Collect live values from the kanban board ──────────────
      var stageVals = [];
      document.querySelectorAll('.kanban-col[data-stage]').forEach(function(col) {
        stageVals.push(col.getAttribute('data-stage'));
      });

      var companySet = new Set();
      document.querySelectorAll('.kanban-card').forEach(function(card) {
        var spans = card.querySelectorAll('.kanban-card-meta span');
        if (spans[1]) companySet.add(spans[1].textContent.trim());
      });
      var companyVals = Array.from(companySet).filter(Boolean).sort();

      var FIELDS = [
        { key: 'stage',   label: 'Stage',       type: 'enum',   values: stageVals },
        { key: 'company', label: 'Company',      type: 'enum',   values: companyVals },
        { key: 'amount',  label: 'Amount',       type: 'number', values: [] },
        { key: 'owner',   label: 'Owner',        type: 'text',   values: [] },
        { key: 'created', label: 'Created date', type: 'date',   values: [] },
      ];

      var OPS = {
        enum:   ['is', 'is not'],
        number: ['equals', 'is greater than', 'is less than'],
        text:   ['contains', 'equals'],
        date:   ['is before', 'is after', 'is'],
      };

      function opHtml(type) {
        return (OPS[type] || OPS.text).map(function(o) { return '<option>' + o + '</option>'; }).join('');
      }

      function valueHtml(field) {
        if (field.type === 'enum' && field.values.length) {
          return '<select id="nf-val"><option value="">— select —</option>' +
            field.values.map(function(v) { return '<option>' + v + '</option>'; }).join('') + '</select>';
        }
        if (field.type === 'number') return '<input id="nf-val" type="number" placeholder="e.g. 10000" />';
        if (field.type === 'date')   return '<input id="nf-val" type="date" />';
        return '<input id="nf-val" type="text" placeholder="Enter value…" />';
      }

      var def = FIELDS[0];

      // Expose updater globally so inline onchange can reach it
      window.__nfFields = FIELDS;
      window.__nfChange = function(sel) {
        var field = FIELDS.find(function(f) { return f.key === sel.value; }) || FIELDS[0];
        var opEl = document.getElementById('nf-op');
        var vwEl = document.getElementById('nf-vw');
        if (opEl) opEl.innerHTML = opHtml(field.type);
        if (vwEl) vwEl.innerHTML = valueHtml(field);
      };

      return {
        eyebrow: "M1 · F1.6 · New Filter",
        title: "Add filter condition",
        body: '<div class="field-row">' +
          '<div class="field"><label>Field</label>' +
          '<select id="nf-field" onchange="window.__nfChange(this)">' +
          FIELDS.map(function(f) { return '<option value="' + f.key + '">' + f.label + '</option>'; }).join('') +
          '</select></div>' +
          '<div class="field"><label>Operator</label>' +
          '<select id="nf-op">' + opHtml(def.type) + '</select></div>' +
          '</div>' +
          '<div class="field"><label>Value</label>' +
          '<div id="nf-vw">' + valueHtml(def) + '</div></div>',
        primaryLabel: "Add filter",
        onSave: () => {
          var fieldEl = document.getElementById('nf-field');
          var opEl    = document.getElementById('nf-op');
          var valEl   = document.getElementById('nf-val');
          if (!fieldEl || !valEl) { toast("Filter added"); return; }

          var fieldKey = fieldEl.value;
          var op       = opEl ? opEl.value : 'is';
          var val      = valEl.value;
          var field    = (window.__nfFields || []).find(function(f) { return f.key === fieldKey; });
          var fieldLabel = field ? field.label : fieldKey;

          if (!val) { toast("No value selected", { sub: "Pick a value to filter by" }); return; }

          // ── Apply filter to kanban cards ──────────────────────
          document.querySelectorAll('.kanban-card').forEach(function(card) {
            var match = true;
            if (fieldKey === 'stage') {
              var col = card.closest('.kanban-col');
              var stage = col ? col.getAttribute('data-stage') : '';
              match = (op === 'is not') ? stage !== val : stage === val;
            } else if (fieldKey === 'company') {
              var spans = card.querySelectorAll('.kanban-card-meta span');
              var co = spans[1] ? spans[1].textContent.trim() : '';
              match = (op === 'is not') ? co !== val : co === val;
            } else if (fieldKey === 'amount') {
              var amtEl = card.querySelector('.kanban-card-amount');
              var amt = amtEl ? parseFloat(amtEl.textContent.replace(/[^0-9.]/g, '')) : 0;
              var target = parseFloat(val) || 0;
              if (op === 'is greater than') match = amt > target;
              else if (op === 'is less than') match = amt < target;
              else match = amt === target;
            }
            card.style.display = match ? '' : 'none';
          });

          // ── Update column counts ──────────────────────────────
          document.querySelectorAll('.kanban-col').forEach(function(col) {
            var visible = Array.from(col.querySelectorAll('.kanban-card'))
              .filter(function(c) { return c.style.display !== 'none'; }).length;
            var meta    = col.querySelector('.kanban-col-meta');
            var countEl = col.querySelector('.kanban-col-count');
            if (meta)    meta.textContent    = visible + ' deals';
            if (countEl) countEl.textContent = visible;
          });

          toast("Filter applied", { sub: fieldLabel + ' ' + op + ' “' + val + '”' });
        },
      };
    },

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
            <div class="history-meta">01 Jun 2026 · Mayur S. · current</div>
          </div>
          <span class="badge solid">CURRENT</span>
        </div>
        <div class="history-row">
          <span class="history-version">v2</span>
          <div class="grow">
            <div style="font-weight:500;">Added Source (Deal) · Renamed "Acct Type" → "ACV tier"</div>
            <div class="history-meta">27 May 2026 · Sarah K.</div>
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

    // Ensure sidebar is never collapsed — clear any persisted collapsed state
    localStorage.removeItem('ss_sidebar_collapsed');
    var sidebarApp = document.querySelector('.app');
    if (sidebarApp) sidebarApp.classList.remove('sidebar-collapsed');

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

      // 2. Search trigger — must come before the <a> skip
      if (e.target.closest("[data-action='open-search']")) {
        e.preventDefault();
        if (openGlobalSearch) openGlobalSearch();
        return;
      }

      // 3. Skip clicks inside slide-over and plain links
      if (e.target.closest(".slide-over")) return;
      if (e.target.closest("a")) return;

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
          var ctx = {};
          var currentRecord = (document.querySelector(".breadcrumb .current") || {}).textContent || "";
          var onDetail = window.location.pathname.indexOf("detail") !== -1;
          if (pageId === "companies") ctx.company = (onDetail && currentRecord) ? currentRecord : "(Selected company)";
          if (pageId === "contacts") ctx.linkedTo = (onDetail && currentRecord) ? currentRecord : "(Selected contact)";
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
    WA: { name: "Workspace Admin", desc: "Tenant owner — billing, SSO, audit, residency",     level: 5, category: "Owner",      badgeBg: "#000000", badgeFg: "#ffffff" },
    SM: { name: "Sales Manager",   desc: "Team lead — pipeline review, forecast, coaching",    level: 4, category: "Management", badgeBg: "#1d3461", badgeFg: "#ffffff" },
    RO: { name: "RevOps Lead",     desc: "Schema, pipelines, selling rules, data hygiene",     level: 3, category: "Operations",  badgeBg: "#1b5e37", badgeFg: "#ffffff" },
    SR: { name: "Sales Rep",       desc: "Daily-driver IC — owns contacts, deals, activities", level: 2, category: "Standard",    badgeBg: "#5a3e85", badgeFg: "#ffffff" },
    JR: { name: "Junior Rep",      desc: "Restricted: cannot see deals where amount > $100k",  level: 1, category: "Restricted",  badgeBg: "#e8e8e8", badgeFg: "#555555" },
  };

  function getRole() {
    return localStorage.getItem("ss_role") || "WA";
  }

  function setRole(role) {
    // F9 — Last-admin guard: warn when the sole WA would be demoted
    if (getRole() === "WA" && role !== "WA") {
      toast("Last-admin guard triggered", {
        sub: "No other Workspace Admin exists — production blocks this. Demo allows view-only switch.",
        duration: 5000,
      });
    }
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
    // Update role switcher pill colour + label
    const pill = document.querySelector(".role-switcher .role-pill");
    if (pill) {
      pill.textContent = role;
      const rd = ROLES[role];
      if (rd) { pill.style.background = rd.badgeBg; pill.style.color = rd.badgeFg; }
    }
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
    const currentRoleData = ROLES[role];
    switcher.innerHTML = `<span>View as</span><span class="role-pill" style="background:${currentRoleData.badgeBg};color:${currentRoleData.badgeFg};">${role}</span>`;
    topbarActions.insertBefore(switcher, topbarActions.firstChild);

    const menu = document.createElement("div");
    menu.className = "role-switcher-menu";
    menu.innerHTML = Object.entries(ROLES).map(([code, r]) => {
      const isActive = code === role;
      const dots = Array.from({length: 5}, (_, i) =>
        `<span class="access-dot ${i < r.level ? 'on' : ''}"></span>`
      ).join('');
      return `
        <button class="role-option ${isActive ? 'active' : ''}" data-role-set="${code}">
          <div class="role-header">
            <span class="role-badge" style="background:${r.badgeBg};color:${r.badgeFg};">${code}</span>
            <div class="role-meta">
              <div class="role-name">${r.name}</div>
              <span class="role-category-tag">${r.category}</span>
            </div>
            <div class="role-access-bar" title="Access level ${r.level} of 5">${dots}</div>
          </div>
          <div class="role-code">${isActive ? '● Current' : '○ Switch to'}</div>
          <div class="role-desc">${r.desc}</div>
        </button>
      `;
    }).join('');
    document.body.appendChild(menu);

    switcher.addEventListener("click", e => {
      e.stopPropagation();
      // Close any other open panels before toggling
      var nd = document.getElementById("notif-drawer");
      var hd = document.getElementById("help-drawer");
      if (nd) nd.classList.remove("open");
      if (hd) hd.classList.remove("open");
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
        if (window.SS_API && window.SS_API.Auth) {
          window.SS_API.Auth.logout();
        } else {
          localStorage.removeItem("ss_token");
          localStorage.removeItem("ss_user");
          localStorage.removeItem("ss_workspace");
          window.location.href = "index.html";
        }
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
        var completedRow = row;
        SS.toast("Task marked complete", {
          sub: "Moved to Completed",
          duration: 8000,
          action: "Undo",
          onAction: function () {
            completedRow.classList.remove("task-completed");
            var cb = completedRow.querySelector("input[type='checkbox']");
            if (cb) cb.checked = false;
          },
        });
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
          // Close any other open panels before toggling
          var rm = document.querySelector(".role-switcher-menu");
          var hd = document.getElementById("help-drawer");
          if (rm) rm.classList.remove("open");
          if (hd) hd.classList.remove("open");
          var nd = document.getElementById("notif-drawer");
          if (nd) {
            nd.classList.toggle("open");
            if (nd.classList.contains("open")) {
              nd.querySelectorAll(".notif-item.unread").forEach(function (item) {
                item.classList.remove("unread");
              });
              var badge = document.getElementById("notif-badge");
              if (badge) badge.style.display = "none";
            }
          }
        });
        // unread count badge — min-width prevents 2-digit overlap (G17)
        var unreadCount = document.querySelectorAll('.notif-item.unread').length || 3;
        icon.innerHTML = '<span style="position:relative;display:inline-flex;align-items:center;justify-content:center;">○' +
          '<span id="notif-badge" style="position:absolute;top:-6px;right:-14px;min-width:16px;height:16px;padding:0 4px;background:var(--ink);color:var(--paper);border-radius:8px;font-size:9px;font-family:var(--mono);font-weight:500;display:flex;align-items:center;justify-content:center;line-height:1;">' +
          unreadCount + '</span></span>';
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
      { selector: "Open tasks", href: "tasks.html" },
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

      // Pipeline "Settings" button → open pipeline-settings slide-over
      if (text === "settings") {
        var card = btn.closest(".card.mb-5");
        if (card) {
          e.preventDefault();
          e.stopImmediatePropagation();

          // Read name
          var titleEl = card.querySelector(".card-title");
          var pName   = titleEl ? titleEl.textContent.trim() : "Pipeline";

          // Read sub for visibility
          var subEl = card.querySelector(".card-sub");
          var subTxt = subEl ? subEl.textContent : "";
          var visMatch = subTxt.match(/Visible to:\s*(.+?)(?:\s*·|$)/i)
                      || subTxt.match(/Restricted to:\s*(.+?)(?:\s*·|$)/i);
          var pVisibility = visMatch ? visMatch[1].trim() : "All roles";

          // Read stages from table rows, or from compact text span
          var pStages = [];
          card.querySelectorAll("table tbody tr").forEach(function(row) {
            var tds = row.querySelectorAll("td");
            if (tds[1]) pStages.push({
              name: tds[1].textContent.trim(),
              prob: tds[2] ? tds[2].textContent.trim() : "—"
            });
          });
          if (pStages.length === 0) {
            var stagesSpan = Array.from(card.querySelectorAll(".text-muted span"))
              .find(function(el) { return el.textContent.includes("Stages:"); });
            if (stagesSpan) {
              stagesSpan.textContent.replace(/Stages:\s*/i, "").split("·").forEach(function(s) {
                var n = s.trim(); if (n) pStages.push({ name: n, prob: "—" });
              });
            }
          }

          if (window.SS_openSlide) {
            window.SS_openSlide("pipeline-settings", { name: pName, stages: pStages, visibility: pVisibility, cardEl: card });
          }
          return;
        }
      }

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
  // TABLE SEARCH WITH EMPTY STATE (B7)
  // ============================================================
  function wireTableSearch() {
    var pageId = document.body.getAttribute("data-page");
    var listPages = ["contacts", "companies", "deals", "tasks"];
    if (listPages.indexOf(pageId) === -1) return;
    var filterRow = document.querySelector(".row.mb-4");
    if (!filterRow || filterRow.querySelector(".table-search")) return;
    var input = document.createElement("input");
    input.type = "search";
    input.className = "btn sm table-search";
    input.placeholder = "Search…";
    input.style.cssText = "padding:4px 10px;font-size:11px;width:180px;cursor:text;";
    filterRow.appendChild(input);
    var emptyRow = null;
    input.addEventListener("input", function () {
      var term = input.value.trim().toLowerCase();
      var tbody = document.querySelector(".table tbody");
      if (!tbody) return;
      var rows = Array.prototype.slice.call(tbody.querySelectorAll("tr:not(.empty-search-row)"));
      var visible = 0;
      rows.forEach(function (r) {
        var show = !term || r.textContent.toLowerCase().indexOf(term) !== -1;
        r.style.display = show ? "" : "none";
        if (show) visible++;
      });
      if (!emptyRow) {
        emptyRow = document.createElement("tr");
        emptyRow.className = "empty-search-row no-hover";
        var cols = rows[0] ? rows[0].querySelectorAll("td,th").length : 6;
        emptyRow.innerHTML = "<td colspan=\"" + cols + "\" style=\"text-align:center;padding:48px 24px;color:var(--ink-30);font-size:13px;\">No records match “<strong style='color:var(--ink);'></strong>” — try a different term.</td>";
        tbody.appendChild(emptyRow);
      }
      var strong = emptyRow.querySelector("strong");
      if (strong) strong.textContent = term;
      emptyRow.style.display = (visible === 0 && term) ? "" : "none";
    });
  }

  // ============================================================
  // DETAIL BACK NAV (F11) + LIST SCROLL RESTORE (F12)
  // ============================================================
  function wireDetailNavigation() {
    var isDetail = window.location.pathname.indexOf("detail") !== -1;
    var pageId = document.body.getAttribute("data-page") || "";
    var pathname = window.location.pathname;

    // F12 — Save scroll before leaving a list; restore on return
    var listPages = ["contacts", "companies", "deals", "tasks", "activities"];
    if (listPages.indexOf(pageId) !== -1 && !isDetail) {
      var saved = sessionStorage.getItem("scroll:" + pathname);
      if (saved) {
        requestAnimationFrame(function () { window.scrollTo(0, parseInt(saved, 10)); });
        sessionStorage.removeItem("scroll:" + pathname);
      }
      document.addEventListener("click", function (e) {
        var link = e.target.closest("tr[onclick], .kanban-card, a[href*='detail']");
        if (link) sessionStorage.setItem("scroll:" + pathname, String(Math.round(window.scrollY)));
      }, true);
    }

    // F11 — Smart back button: history.back() or fall back to parent list
    if (!isDetail) return;
    var topbarActions = document.querySelector(".topbar-actions");
    if (!topbarActions) return;
    var parentAnchor = document.querySelector(".breadcrumb a");
    var parentHref = parentAnchor ? parentAnchor.getAttribute("href") : "index.html";
    var backBtn = document.createElement("button");
    backBtn.className = "btn sm ghost";
    backBtn.textContent = "← Back";
    backBtn.addEventListener("click", function () {
      if (window.history.length > 1 && document.referrer && document.referrer.indexOf("detail") === -1) {
        window.history.back();
      } else {
        window.location.href = parentHref;
      }
    });
    topbarActions.insertBefore(backBtn, topbarActions.firstChild);
  }

  // ============================================================
  // BOOT
  // ============================================================
  ready(() => {
    injectRoleSwitcher();
    applyRole(getRole());
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
    wireTableSearch();
    wireDetailNavigation();
    wireLastAdminGuard();
    buildGlobalSearch();
  });

  // ============================================================
  // GLOBAL SEARCH — inline sidebar input + fixed dropdown
  // ============================================================
  var openGlobalSearch = null;

  function buildGlobalSearch() {
    var searchInput = document.getElementById("sidebar-search-input");
    if (!searchInput) return;

    var dropdown = document.createElement("div");
    dropdown.id = "sidebar-search-dropdown";
    dropdown.className = "sidebar-search-dropdown";
    document.body.appendChild(dropdown);

    var cache = null;
    var selectedIdx = -1;
    var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    function esc(s) {
      return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    }
    function fmtDate(iso) {
      if (!iso) return "";
      var p = iso.slice(0, 10).split("-");
      var d = parseInt(p[2], 10);
      return (d < 10 ? "0" + d : "" + d) + " " + MONTHS[parseInt(p[1], 10) - 1] + " " + p[0];
    }
    function positionDropdown() {
      var rect = searchInput.getBoundingClientRect();
      dropdown.style.top  = (rect.bottom + 4) + "px";
      dropdown.style.left = rect.left + "px";
      dropdown.style.width = Math.max(rect.width, 260) + "px";
    }
    function showDropdown() { positionDropdown(); dropdown.style.display = "block"; }
    function hideDropdown() { dropdown.style.display = "none"; selectedIdx = -1; }

    function warmCache() {
      if (cache || !window.SS_API) return;
      Promise.all([
        window.SS_API.Contacts.list().catch(function () { return { contacts: [] }; }),
        window.SS_API.Companies.list().catch(function () { return { companies: [] }; }),
        window.SS_API.Deals.list().catch(function () { return { deals: [] }; }),
        window.SS_API.Tasks.list().catch(function () { return { tasks: [] }; }),
      ]).then(function (res) {
        cache = {
          contacts:  (res[0] && res[0].contacts)  || [],
          companies: (res[1] && res[1].companies) || [],
          deals:     (res[2] && res[2].deals)     || [],
          tasks:     (res[3] && res[3].tasks)     || [],
        };
        var term = searchInput.value.trim();
        if (term) renderResults(term);
      }).catch(function () {});
    }

    function filterItems(arr, term, getText) {
      var t = term.toLowerCase();
      return arr.filter(function (x) { return getText(x).toLowerCase().indexOf(t) !== -1; });
    }

    function renderResults(term) {
      if (!term) { hideDropdown(); return; }
      if (!cache) {
        showDropdown();
        dropdown.innerHTML = '<div class="search-loading">Loading…</div>';
        warmCache();
        return;
      }
      var contacts = filterItems(cache.contacts, term, function (c) {
        return (c.firstName || "") + " " + (c.lastName || "") + " " + (c.email || "") + " " + (c.title || "");
      }).slice(0, 4);
      var companies = filterItems(cache.companies, term, function (c) {
        return c.name + " " + (c.industry || "") + " " + (c.domain || "");
      }).slice(0, 3);
      var deals = filterItems(cache.deals, term, function (d) {
        return d.name + " " + (d.stage || "") + " " + ((d.company && d.company.name) || "");
      }).slice(0, 3);
      var tasks = filterItems(cache.tasks, term, function (t) {
        return (t.title || "") + " " + (t.priority || "");
      }).slice(0, 3);

      if (!contacts.length && !companies.length && !deals.length && !tasks.length) {
        showDropdown();
        dropdown.innerHTML = '<div class="search-empty">No results for &ldquo;<strong>' + esc(term) + '</strong>&rdquo;</div>';
        return;
      }
      var html = "";
      if (contacts.length) {
        html += '<div class="search-group"><div class="search-group-label">Contacts</div>';
        contacts.forEach(function (c) {
          var name = esc(((c.firstName || "") + " " + (c.lastName || "")).trim());
          var meta = [c.title, c.company && c.company.name].filter(Boolean).map(esc).join(" · ");
          html += '<a class="search-item" href="contact-detail.html?id=' + esc(c.id) + '">' +
            '<span class="search-item-icon">○</span>' +
            '<div class="search-item-text"><strong>' + name + '</strong>' +
            (meta ? '<span class="search-item-meta">' + meta + '</span>' : '') + '</div></a>';
        });
        html += '</div>';
      }
      if (companies.length) {
        html += '<div class="search-group"><div class="search-group-label">Companies</div>';
        companies.forEach(function (c) {
          var meta = [c.industry, c._count ? c._count.contacts + " contacts" : ""].filter(Boolean).map(esc).join(" · ");
          html += '<a class="search-item" href="company-detail.html?id=' + esc(c.id) + '">' +
            '<span class="search-item-icon">□</span>' +
            '<div class="search-item-text"><strong>' + esc(c.name) + '</strong>' +
            (meta ? '<span class="search-item-meta">' + meta + '</span>' : '') + '</div></a>';
        });
        html += '</div>';
      }
      if (deals.length) {
        html += '<div class="search-group"><div class="search-group-label">Deals</div>';
        deals.forEach(function (d) {
          var meta = esc("$" + Number(d.amount || 0).toLocaleString("en-US") + " · " + (d.stage || ""));
          html += '<a class="search-item" href="deal-detail.html?id=' + esc(d.id) + '">' +
            '<span class="search-item-icon">◇</span>' +
            '<div class="search-item-text"><strong>' + esc(d.name) + '</strong>' +
            '<span class="search-item-meta">' + meta + '</span></div></a>';
        });
        html += '</div>';
      }
      if (tasks.length) {
        html += '<div class="search-group"><div class="search-group-label">Tasks</div>';
        tasks.forEach(function (t) {
          var meta = [(t.priority || "").toUpperCase(), t.dueAt ? "Due " + fmtDate(t.dueAt) : ""]
            .filter(Boolean).map(esc).join(" · ");
          html += '<a class="search-item" href="tasks.html">' +
            '<span class="search-item-icon">✓</span>' +
            '<div class="search-item-text"><strong>' + esc(t.title || "") + '</strong>' +
            (meta ? '<span class="search-item-meta">' + meta + '</span>' : '') + '</div></a>';
        });
        html += '</div>';
      }
      showDropdown();
      dropdown.innerHTML = html;
      selectedIdx = -1;
    }

    function highlightItem() {
      var items = dropdown.querySelectorAll(".search-item");
      if (!items.length) return;
      selectedIdx = Math.max(0, Math.min(selectedIdx, items.length - 1));
      items.forEach(function (item, i) { item.classList.toggle("selected", i === selectedIdx); });
      if (items[selectedIdx]) items[selectedIdx].scrollIntoView({ block: "nearest" });
    }

    searchInput.addEventListener("input", function () { renderResults(searchInput.value.trim()); });
    searchInput.addEventListener("focus", function () { warmCache(); if (searchInput.value.trim()) renderResults(searchInput.value.trim()); });
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { searchInput.value = ""; hideDropdown(); searchInput.blur(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); selectedIdx++; highlightItem(); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); selectedIdx = Math.max(0, selectedIdx - 1); highlightItem(); return; }
      if (e.key === "Enter") {
        var items = dropdown.querySelectorAll(".search-item");
        if (selectedIdx >= 0 && items[selectedIdx]) {
          items[selectedIdx].click();
          searchInput.value = "";
          hideDropdown();
        }
      }
    });

    document.addEventListener("click", function (e) {
      if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) hideDropdown();
    });

    document.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });

    openGlobalSearch = function () { searchInput.focus(); searchInput.select(); };
    setTimeout(warmCache, 2000);
    overlay.innerHTML =
      '<div class="search-dialog">' +
        '<div class="search-input-wrap">' +
          '<span class="search-icon">⌕</span>' +
          '<input type="text" id="global-search-input" placeholder="Search contacts, companies, deals, tasks…" autocomplete="off" spellcheck="false" />' +
          '<span class="search-kbd">ESC</span>' +
        '</div>' +
        '<div id="search-results" class="search-results">' +
          '<div class="search-empty">Start typing to search…</div>' +
        '</div>' +
        '<div class="search-footer">' +
          '<span>↑↓ navigate</span>' +
          '<span>↵ open</span>' +
          '<span>ESC close</span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    var input = overlay.querySelector("#global-search-input");
    var resultsEl = overlay.querySelector("#search-results");
    var cache = null;
    var selectedIdx = -1;
    var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    function esc(s) {
      return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    }

    function fmtDate(iso) {
      if (!iso) return "";
      var p = iso.slice(0, 10).split("-");
      var d = parseInt(p[2], 10);
      return (d < 10 ? "0" + d : "" + d) + " " + MONTHS[parseInt(p[1], 10) - 1] + " " + p[0];
    }

    function warmCache() {
      if (cache || !window.SS_API) return;
      Promise.all([
        window.SS_API.Contacts.list().catch(function () { return { contacts: [] }; }),
        window.SS_API.Companies.list().catch(function () { return { companies: [] }; }),
        window.SS_API.Deals.list().catch(function () { return { deals: [] }; }),
        window.SS_API.Tasks.list().catch(function () { return { tasks: [] }; }),
      ]).then(function (res) {
        cache = {
          contacts:  (res[0] && res[0].contacts)  || [],
          companies: (res[1] && res[1].companies) || [],
          deals:     (res[2] && res[2].deals)     || [],
          tasks:     (res[3] && res[3].tasks)     || [],
        };
        // If search is already open and user has typed, re-render with loaded data
        if (overlay.classList.contains("open") && input.value.trim()) {
          renderResults(input.value.trim());
        }
      }).catch(function () {});
    }

    function filterItems(arr, term, getText) {
      var t = term.toLowerCase();
      return arr.filter(function (x) { return getText(x).toLowerCase().indexOf(t) !== -1; });
    }

    function renderResults(term) {
      if (!term) {
        resultsEl.innerHTML = '<div class="search-empty">Start typing to search…</div>';
        return;
      }
      if (!cache) {
        resultsEl.innerHTML = '<div class="search-loading">Loading…</div>';
        warmCache();
        return;
      }

      var contacts = filterItems(cache.contacts, term, function (c) {
        return (c.firstName || "") + " " + (c.lastName || "") + " " + (c.email || "") + " " + (c.title || "");
      }).slice(0, 4);
      var companies = filterItems(cache.companies, term, function (c) {
        return c.name + " " + (c.industry || "") + " " + (c.domain || "");
      }).slice(0, 3);
      var deals = filterItems(cache.deals, term, function (d) {
        return d.name + " " + (d.stage || "") + " " + ((d.company && d.company.name) || "");
      }).slice(0, 3);
      var tasks = filterItems(cache.tasks, term, function (t) {
        return (t.title || "") + " " + (t.priority || "");
      }).slice(0, 3);

      if (!contacts.length && !companies.length && !deals.length && !tasks.length) {
        resultsEl.innerHTML = '<div class="search-empty">No results for <strong>&ldquo;' + esc(term) + '&rdquo;</strong></div>';
        return;
      }

      var html = "";
      if (contacts.length) {
        html += '<div class="search-group"><div class="search-group-label">Contacts</div>';
        contacts.forEach(function (c) {
          var name = esc(((c.firstName || "") + " " + (c.lastName || "")).trim());
          var meta = [c.title, c.company && c.company.name].filter(Boolean).map(esc).join(" · ");
          html += '<a class="search-item" href="contact-detail.html?id=' + esc(c.id) + '">' +
            '<span class="search-item-icon">○</span>' +
            '<div class="search-item-text"><strong>' + name + '</strong>' +
            (meta ? '<span class="search-item-meta">' + meta + '</span>' : '') +
            '</div></a>';
        });
        html += '</div>';
      }
      if (companies.length) {
        html += '<div class="search-group"><div class="search-group-label">Companies</div>';
        companies.forEach(function (c) {
          var meta = [c.industry, c._count ? c._count.contacts + " contacts" : ""].filter(Boolean).map(esc).join(" · ");
          html += '<a class="search-item" href="company-detail.html?id=' + esc(c.id) + '">' +
            '<span class="search-item-icon">□</span>' +
            '<div class="search-item-text"><strong>' + esc(c.name) + '</strong>' +
            (meta ? '<span class="search-item-meta">' + meta + '</span>' : '') +
            '</div></a>';
        });
        html += '</div>';
      }
      if (deals.length) {
        html += '<div class="search-group"><div class="search-group-label">Deals</div>';
        deals.forEach(function (d) {
          var meta = esc("$" + Number(d.amount || 0).toLocaleString("en-US") + " · " + (d.stage || ""));
          html += '<a class="search-item" href="deal-detail.html?id=' + esc(d.id) + '">' +
            '<span class="search-item-icon">◇</span>' +
            '<div class="search-item-text"><strong>' + esc(d.name) + '</strong>' +
            '<span class="search-item-meta">' + meta + '</span>' +
            '</div></a>';
        });
        html += '</div>';
      }
      if (tasks.length) {
        html += '<div class="search-group"><div class="search-group-label">Tasks</div>';
        tasks.forEach(function (t) {
          var meta = [(t.priority || "").toUpperCase(), t.dueAt ? "Due " + fmtDate(t.dueAt) : ""]
            .filter(Boolean).map(esc).join(" · ");
          html += '<a class="search-item" href="tasks.html">' +
            '<span class="search-item-icon">✓</span>' +
            '<div class="search-item-text"><strong>' + esc(t.title || "") + '</strong>' +
            (meta ? '<span class="search-item-meta">' + meta + '</span>' : '') +
            '</div></a>';
        });
        html += '</div>';
      }
      resultsEl.innerHTML = html;
      selectedIdx = -1;
    }

    function highlightItem() {
      var items = resultsEl.querySelectorAll(".search-item");
      if (!items.length) return;
      selectedIdx = Math.max(0, Math.min(selectedIdx, items.length - 1));
      items.forEach(function (item, i) { item.classList.toggle("selected", i === selectedIdx); });
      if (items[selectedIdx]) items[selectedIdx].scrollIntoView({ block: "nearest" });
    }

    function openSearch() {
      overlay.classList.add("open");
      warmCache();
      setTimeout(function () { input.focus(); }, 80);
    }

    function closeSearch() {
      overlay.classList.remove("open");
      input.value = "";
      resultsEl.innerHTML = '<div class="search-empty">Start typing to search…</div>';
      selectedIdx = -1;
    }

    // Expose so the sidebar click handler can call it
    openGlobalSearch = openSearch;

    // Wire sidebar .search-trigger directly (redundant-safe: also handled in delegation)
    var sidebarTrigger = document.querySelector("[data-action='open-search']");
    if (sidebarTrigger) {
      sidebarTrigger.setAttribute("tabindex", "0");
      sidebarTrigger.addEventListener("click", function (e) {
        e.preventDefault();
        openSearch();
      });
      // Typing any printable key while the trigger is focused opens the modal and seeds it
      sidebarTrigger.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openSearch(); return; }
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          openSearch();
          var ch = e.key;
          setTimeout(function () {
            input.value = ch;
            renderResults(ch);
          }, 60);
        }
      });
    }

    // Backdrop click closes
    overlay.addEventListener("click", function (e) { if (e.target === overlay) closeSearch(); });

    // Input events
    input.addEventListener("input", function () { renderResults(input.value.trim()); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeSearch(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); selectedIdx++; highlightItem(); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); selectedIdx = Math.max(0, selectedIdx - 1); highlightItem(); return; }
      if (e.key === "Enter") {
        var items = resultsEl.querySelectorAll(".search-item");
        if (selectedIdx >= 0 && items[selectedIdx]) { items[selectedIdx].click(); closeSearch(); }
      }
    });

    // ⌘K / Ctrl+K global shortcut
    document.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        overlay.classList.contains("open") ? closeSearch() : openSearch();
      }
    });

    // Pre-warm cache 2 s after page load (non-blocking, silent)
    setTimeout(warmCache, 2000);
  }

  // F9 — Block destructive user-management actions against the sole WA
  function wireLastAdminGuard() {
    if (window.location.pathname.indexOf("settings") === -1) return;
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("button, a.btn");
      if (!btn) return;
      var text = (btn.textContent || "").trim().toLowerCase();
      var destructive = text === "remove user" || text === "delete user" ||
                        text === "remove admin" || text === "revoke admin";
      if (!destructive) return;
      var isLastAdmin = (localStorage.getItem("ss_role") || "WA") === "WA";
      if (isLastAdmin) {
        e.stopImmediatePropagation();
        e.preventDefault();
        toast("Last-admin guard", {
          sub: "Cannot remove the sole Workspace Admin. Add another admin first.",
          duration: 5000,
        });
      }
    }, true);
  }

  window.SS_toast = function (msg, opts) { toast(msg, opts); };
})();