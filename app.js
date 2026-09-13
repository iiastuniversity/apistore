const STORAGE_KEY = 'api_key_vault_v1';
const THEME_KEY = 'api_key_vault_theme';

const ACCESS = {
  owner: 'DHDipu',
  email: 'iiastuniversity@gmail.com',
  hash: 'bf00031ecccbda18f83e00f0fd82ca1e58caf34b9b1c0f22c9424e2d3ca6516d',
};

const state = {
  keys: [],
  query: '',
  category: '',
  revealed: false,
};

const $ = (sel) => document.querySelector(sel);

const els = {
  list: $('#list'),
  empty: $('#empty'),
  stats: $('#stats'),
  search: $('#search'),
  filterCategory: $('#filterCategory'),
  toggleKeys: $('#toggleKeys'),
  addBtn: $('#addBtn'),
  exportBtn: $('#exportBtn'),
  importBtn: $('#importBtn'),
  importFile: $('#importFile'),
  wipeBtn: $('#wipeBtn'),
  modal: $('#modal'),
  modalTitle: $('#modalTitle'),
  form: $('#form'),
  editId: $('#editId'),
  fName: $('#fName'),
  fKey: $('#fKey'),
  modelList: $('#modelList'),
  addModelRow: $('#addModelRow'),
  fSite: $('#fSite'),
  fCategory: $('#fCategory'),
  fNotes: $('#fNotes'),
  categoryList: $('#categoryList'),
  cancelBtn: $('#cancelBtn'),
  toggleFormKey: $('#toggleFormKey'),
  themeBtn: $('#themeBtn'),
  lockBtn: $('#lockBtn'),
  lockScreen: $('#lockScreen'),
  lockCard: $('#lockCard'),
  gateInput: $('#gateInput'),
  gateUnlock: $('#gateUnlock'),
  gateHint: $('#gateHint'),
  requestLink: $('#requestLink'),
  toast: $('#toast'),
};

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  els.themeBtn.innerHTML = theme === 'light' ? '&#127774;' : '&#127769;';
  els.themeBtn.title = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    state.keys = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(state.keys)) state.keys = [];
  } catch {
    state.keys = [];
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.keys));
    return true;
  } catch (e) {
    toast('Could not save. Storage may be full.', true);
    return false;
  }
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

let toastTimer;
function toast(msg, isError = false) {
  els.toast.textContent = msg;
  els.toast.classList.toggle('error', isError);
  els.toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (els.toast.hidden = true), 1900);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch {}
    document.body.removeChild(ta);
    return ok;
  }
}

function maskKey(key) {
  if (key.length <= 8) return '•'.repeat(Math.max(key.length, 4));
  return key.slice(0, 4) + '•'.repeat(Math.min(key.length - 8, 24)) + key.slice(-4);
}

function getFiltered() {
  const q = state.query.trim().toLowerCase();
  return state.keys.filter((k) => {
    if (state.category && (k.category || '') !== state.category) return false;
    if (!q) return true;
    const models = (k.models || []).map((m) => `${m.name} ${m.label}`).join(' ');
    return [k.name, models, k.site, k.category, k.notes, k.key]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });
}

function renderCategories() {
  const cats = [...new Set(state.keys.map((k) => (k.category || '').trim()).filter(Boolean))].sort();
  els.filterCategory.innerHTML =
    '<option value="">All categories</option>' +
    cats.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  els.filterCategory.value = state.category;
  els.categoryList.innerHTML = cats.map((c) => `<option value="${escapeHtml(c)}"></option>`).join('');
}

function render() {
  const items = getFiltered();
  els.stats.textContent = `${state.keys.length} key${state.keys.length === 1 ? '' : 's'} saved`;
  els.empty.hidden = state.keys.length !== 0;
  els.list.hidden = state.keys.length === 0;
  els.toggleKeys.textContent = state.revealed ? 'Hide all' : 'Reveal all';

  els.list.innerHTML = items
    .map((k) => {
      const shown = state.revealed;
      const modelChips = (k.models || [])
        .filter((m) => m.name || m.label)
        .map(
          (m) =>
            `<span class="model-chip"><b>${escapeHtml(m.name || '—')}</b>${m.label ? ` <span class="model-label">${escapeHtml(m.label)}</span>` : ''}</span>`
        )
        .join('');
      return `
      <article class="card" data-id="${k.id}">
        <div class="card-head">
          <div>
            <div class="card-title">${escapeHtml(k.name)}</div>
            ${k.site ? `<div class="card-site">${escapeHtml(k.site)}</div>` : ''}
          </div>
          <div class="card-actions">
            <button class="icon-btn" data-action="toggle" title="Show/Hide">&#128065;</button>
            <button class="icon-btn" data-action="edit" title="Edit">&#9998;</button>
            <button class="icon-btn" data-action="delete" title="Delete">&#128465;</button>
          </div>
        </div>
        <div class="key-box">
          <span class="key-text ${shown ? '' : 'hidden'}" data-raw="${escapeHtml(k.key)}">${escapeHtml(shown ? k.key : maskKey(k.key))}</span>
          <button class="icon-btn" data-action="copy" title="Copy">&#128203;</button>
        </div>
        ${modelChips ? `<div class="model-chips">&#129302; ${modelChips}</div>` : ''}
        ${k.category ? `<span class="badge">${escapeHtml(k.category)}</span>` : ''}
        ${k.notes ? `<div class="card-notes">${escapeHtml(k.notes)}</div>` : ''}
      </article>`;
    })
    .join('');

  if (state.keys.length > 0 && items.length === 0) {
    els.list.innerHTML = `<p style="color:var(--muted);grid-column:1/-1;text-align:center;padding:40px 0">No keys match your search.</p>`;
  }
}

function addModelRow(name = '', label = '') {
  const row = document.createElement('div');
  row.className = 'model-row';
  row.innerHTML = `
    <input type="text" class="model-name" placeholder="Model name (e.g. gpt-4o)" value="${escapeHtml(name)}" />
    <input type="text" class="model-label" placeholder="Display name (e.g. GPT-4o)" value="${escapeHtml(label)}" />
    <button type="button" class="icon-btn remove-model" title="Remove">&#128465;</button>`;
  row.querySelector('.remove-model').addEventListener('click', () => row.remove());
  els.modelList.appendChild(row);
}

function readModelRows() {
  return [...els.modelList.querySelectorAll('.model-row')]
    .map((row) => ({
      name: row.querySelector('.model-name').value.trim(),
      label: row.querySelector('.model-label').value.trim(),
    }))
    .filter((m) => m.name || m.label);
}

function openModal(entry = null) {
  els.form.reset();
  els.modelList.innerHTML = '';
  if (entry) {
    els.modalTitle.textContent = 'Edit API Key';
    els.editId.value = entry.id;
    els.fName.value = entry.name;
    els.fKey.value = entry.key;
    els.fSite.value = entry.site || '';
    els.fCategory.value = entry.category || '';
    els.fNotes.value = entry.notes || '';
    const models = entry.models || [];
    if (models.length === 0) addModelRow();
    else models.forEach((m) => addModelRow(m.name, m.label));
  } else {
    els.modalTitle.textContent = 'Add API Key';
    els.editId.value = '';
    addModelRow();
  }
  els.fKey.type = 'text';
  els.modal.hidden = false;
  setTimeout(() => els.fName.focus(), 50);
}

function closeModal() {
  els.modal.hidden = true;
}

function handleSubmit(e) {
  e.preventDefault();
  const id = els.editId.value;
  const data = {
    name: els.fName.value.trim(),
    key: els.fKey.value.trim(),
    models: readModelRows(),
    site: els.fSite.value.trim(),
    category: els.fCategory.value.trim(),
    notes: els.fNotes.value.trim(),
  };
  if (!data.name || !data.key) return;

  if (id) {
    const idx = state.keys.findIndex((k) => k.id === id);
    if (idx !== -1) state.keys[idx] = { ...state.keys[idx], ...data };
  } else {
    state.keys.unshift({ id: uid(), ...data, createdAt: Date.now() });
  }

  if (save()) {
    closeModal();
    renderCategories();
    render();
    toast(id ? 'Key updated' : 'Key saved');
  }
}

function onListClick(e) {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const card = btn.closest('.card');
  const id = card?.dataset.id;
  const entry = state.keys.find((k) => k.id === id);
  if (!entry) return;

  const action = btn.dataset.action;
  if (action === 'copy') {
    copyText(entry.key).then((ok) => toast(ok ? 'API key copied!' : 'Copy failed', !ok));
  } else if (action === 'toggle') {
    const span = card.querySelector('.key-text');
    const isHidden = span.classList.toggle('hidden');
    span.textContent = isHidden ? maskKey(entry.key) : entry.key;
  } else if (action === 'edit') {
    openModal(entry);
  } else if (action === 'delete') {
    if (confirm(`Delete "${entry.name}"?`)) {
      state.keys = state.keys.filter((k) => k.id !== id);
      save();
      renderCategories();
      render();
      toast('Key deleted');
    }
  }
}

function exportData() {
  if (state.keys.length === 0) return toast('Nothing to export', true);
  const payload = { app: 'api-key-vault', version: 1, exportedAt: new Date().toISOString(), keys: state.keys };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `api-keys-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Backup downloaded');
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const incoming = Array.isArray(parsed) ? parsed : parsed.keys;
      if (!Array.isArray(incoming)) throw new Error('bad format');

      let added = 0;
      incoming.forEach((item) => {
        if (!item || !item.key) return;
        const exists = state.keys.some(
          (k) => k.key === item.key && k.name === item.name
        );
        if (exists) return;
        state.keys.push({
          id: item.id || uid(),
          name: item.name || 'Untitled',
          key: item.key,
          models: Array.isArray(item.models)
            ? item.models
            : item.model
              ? [{ name: item.model, label: '' }]
              : [],
          site: item.site || '',
          category: item.category || '',
          notes: item.notes || '',
          createdAt: item.createdAt || Date.now(),
        });
        added++;
      });

      save();
      renderCategories();
      render();
      toast(`Imported ${added} key${added === 1 ? '' : 's'}`);
    } catch {
      toast('Invalid backup file', true);
    }
  };
  reader.readAsText(file);
}

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function showGate() {
  els.lockScreen.hidden = false;
  setTimeout(() => els.gateInput.focus(), 50);
}

function hideGate() {
  els.lockScreen.hidden = true;
  els.gateInput.value = '';
  els.gateHint.textContent = '';
}

async function tryUnlock() {
  const code = els.gateInput.value;
  if (!code) return;
  const hash = await sha256(code);
  if (hash === ACCESS.hash) {
    sessionStorage.setItem('api_key_vault_unlocked', '1');
    hideGate();
    toast('Unlocked');
  } else {
    els.gateHint.textContent = 'Wrong access code. Try again.';
    els.lockCard.classList.add('shake');
    setTimeout(() => els.lockCard.classList.remove('shake'), 320);
    els.gateInput.value = '';
  }
}

function lockNow() {
  sessionStorage.removeItem('api_key_vault_unlocked');
  state.revealed = false;
  render();
  showGate();
}

function setupRequestLink() {
  const subject = encodeURIComponent('Request to access you API website');
  const body = encodeURIComponent(
    'Hello,\n\nI would like to request access to your API Key Vault website.\n\nMy email: \nPurpose: \n\nThank you.'
  );
  els.requestLink.href = `mailto:${ACCESS.email}?subject=${subject}&body=${body}`;
}

function isUnlocked() {
  return sessionStorage.getItem('api_key_vault_unlocked') === '1';
}

function init() {
  initTheme();
  load();
  renderCategories();
  render();
  setupRequestLink();

  els.addBtn.addEventListener('click', () => openModal());
  els.addModelRow.addEventListener('click', () => {
    addModelRow();
    const rows = els.modelList.querySelectorAll('.model-row');
    rows[rows.length - 1].querySelector('.model-name').focus();
  });
  els.cancelBtn.addEventListener('click', closeModal);
  els.form.addEventListener('submit', handleSubmit);
  els.list.addEventListener('click', onListClick);

  els.modal.addEventListener('click', (e) => {
    if (e.target === els.modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !els.modal.hidden) closeModal();
  });

  els.search.addEventListener('input', (e) => {
    state.query = e.target.value;
    render();
  });

  els.filterCategory.addEventListener('change', (e) => {
    state.category = e.target.value;
    render();
  });

  els.toggleKeys.addEventListener('click', () => {
    state.revealed = !state.revealed;
    render();
  });

  els.toggleFormKey.addEventListener('click', () => {
    els.fKey.type = els.fKey.type === 'password' ? 'text' : 'password';
  });

  els.exportBtn.addEventListener('click', exportData);
  els.themeBtn.addEventListener('click', toggleTheme);
  els.lockBtn.addEventListener('click', lockNow);
  els.importBtn.addEventListener('click', () => els.importFile.click());
  els.importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) importData(file);
    e.target.value = '';
  });

  els.gateUnlock.addEventListener('click', tryUnlock);
  els.gateInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') tryUnlock();
  });

  els.wipeBtn.addEventListener('click', () => {
    if (state.keys.length === 0) return toast('No data to delete', true);
    if (confirm('Delete ALL saved API keys? This cannot be undone.')) {
      state.keys = [];
      localStorage.removeItem(STORAGE_KEY);
      renderCategories();
      render();
      toast('All data deleted');
    }
  });

  if (!isUnlocked()) showGate();
}

init();
