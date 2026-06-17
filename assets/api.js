// SmartSense CRM — API client
// Connects the HTML prototype to the live backend

const API_URL = "https://smartsensecrm-production.up.railway.app";

// ─── Token management ───────────────────────────────────────────────
function getToken() {
  return localStorage.getItem("ss_token");
}

function setToken(token) {
  localStorage.setItem("ss_token", token);
}

function clearToken() {
  localStorage.removeItem("ss_token");
  localStorage.removeItem("ss_user");
  localStorage.removeItem("ss_workspace");
}

function getUser() {
  const u = localStorage.getItem("ss_user");
  return u ? JSON.parse(u) : null;
}

function setUser(user, workspace) {
  localStorage.setItem("ss_user", JSON.stringify(user));
  localStorage.setItem("ss_workspace", JSON.stringify(workspace));
}

// ─── Base fetch ──────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    // Only set Content-Type when there is a body — DELETE/GET with no body + this header causes Fastify 400
    ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearToken();
    window.location.href = "index.html";
    return;
  }

  // Some endpoints (e.g. DELETE) return 204 No Content — don't attempt JSON parse
  const contentType = res.headers.get("content-type") || "";
  const hasBody = res.status !== 204 && contentType.includes("application/json");
  const data = hasBody ? await res.json() : null;
  if (!res.ok) throw new Error((data && data.error) || `API error ${res.status}`);
  return data;
}

// ─── Auth ────────────────────────────────────────────────────────────
const Auth = {
  async login(email, password) {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    setUser(data.user, data.workspace);
    return data;
  },

  async register(payload) {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setToken(data.token);
    setUser(data.user, data.workspace);
    return data;
  },

  async me() {
    return apiFetch("/auth/me");
  },

  logout() {
    clearToken();
    window.location.href = "index.html";
  },

  isLoggedIn() {
    return !!getToken();
  },
};

// ─── Contacts ────────────────────────────────────────────────────────
const Contacts = {
  async list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/contacts${query ? "?" + query : ""}`);
  },

  async get(id) {
    return apiFetch(`/contacts/${id}`);
  },

  async create(data) {
    return apiFetch("/contacts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id, data) {
    return apiFetch(`/contacts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async delete(id) {
    return apiFetch(`/contacts/${id}`, { method: "DELETE" });
  },
};

// ─── Companies ───────────────────────────────────────────────────────
const Companies = {
  async list() {
    return apiFetch("/companies");
  },

  async get(id) {
    return apiFetch(`/companies/${id}`);
  },

  async create(data) {
    return apiFetch("/companies", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id, data) {
    return apiFetch(`/companies/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};

// ─── Deals ───────────────────────────────────────────────────────────
const Deals = {
  async list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/deals${query ? "?" + query : ""}`);
  },

  async get(id) {
    return apiFetch(`/deals/${id}`);
  },

  async create(data) {
    return apiFetch("/deals", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id, data) {
    return apiFetch(`/deals/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async markWon(id) {
    return apiFetch(`/deals/${id}/won`, { method: "POST", body: "{}" });
  },

  async markLost(id, lostReason) {
    return apiFetch(`/deals/${id}/lost`, {
      method: "POST",
      body: JSON.stringify({ lostReason }),
    });
  },
};

// ─── Tasks ───────────────────────────────────────────────────────────
const Tasks = {
  async list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/tasks${query ? "?" + query : ""}`);
  },

  async create(data) {
    return apiFetch("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id, data) {
    return apiFetch(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async delete(id) {
    return apiFetch(`/tasks/${id}`, { method: "DELETE" });
  },
};

// ─── Activities ──────────────────────────────────────────────────────
const Activities = {
  async list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/activities${query ? "?" + query : ""}`);
  },

  async create(data) {
    return apiFetch("/activities", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ─── Imports ─────────────────────────────────────────────────────────
const Imports = {
  async upload(file) {
    const token = getToken();
    const form  = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_URL}/imports/upload`, {
      method:  "POST",
      headers: { Authorization: `Bearer ${token}` },
      body:    form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
    return data;
  },

  async saveMappings(jobId, mappings) {
    return apiFetch(`/imports/${jobId}/mappings`, {
      method: "POST",
      body:   JSON.stringify({ mappings }),
    });
  },

  async validate(jobId) {
    return apiFetch(`/imports/${jobId}/validate`);
  },

  async execute(jobId, options) {
    return apiFetch(`/imports/${jobId}/execute`, {
      method: "POST",
      body:   JSON.stringify(options || {}),
    });
  },

  async getJob(jobId) {
    return apiFetch(`/imports/${jobId}`);
  },
};

// ─── Audit Logs ──────────────────────────────────────────────────────
const AuditLogs = {
  async list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/audit-logs${query ? "?" + query : ""}`);
  },
};

// ─── Export ──────────────────────────────────────────────────────────
window.SS_API = { Auth, Contacts, Companies, Deals, Tasks, Activities, Imports, AuditLogs, getUser };