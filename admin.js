const STORAGE_KEY = 'studentFeedback';
const SESSION_KEY = 'feedbackAdmin';
// Demo passcode. Anyone can read it in the page source, so this only keeps
// casual visitors out. It is not real security. Change it before you use it.
const ADMIN_PASSCODE = 'admin123';

// A cell starting with = + - @ could run as a spreadsheet formula, so prefix it.
function csvCell(value) {
  let text = String(value == null ? '' : value);
  if (/^[=+\-@]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}

// Older entries have no "anonymous" flag, so they show their saved name.
function displayName(item) {
  return item.anonymous ? 'Anonymous' : item.name;
}

function toCsv(items) {
  const rows = items.map((i) => [i.date, displayName(i), i.course, i.feedback]);
  return [['Date', 'Name', 'Course', 'Feedback'], ...rows]
    .map((row) => row.map(csvCell).join(','))
    .join('\r\n');
}

if (typeof document !== 'undefined') {
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const panel = document.getElementById('panel');
  const list = document.getElementById('feedback-list');
  const emptyMsg = document.getElementById('empty');
  const count = document.getElementById('count');
  const clearBtn = document.getElementById('clear-btn');
  const exportBtn = document.getElementById('export-btn');
  const logoutBtn = document.getElementById('logout-btn');

  const load = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  };

  const save = (items) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) { /* storage unavailable */ }
  };

  const isSignedIn = () => {
    try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch (e) { return false; }
  };

  const setSignedIn = (value) => {
    try {
      if (value) sessionStorage.setItem(SESSION_KEY, '1');
      else sessionStorage.removeItem(SESSION_KEY);
    } catch (e) { /* ignore */ }
  };

  const render = () => {
    const items = load();
    list.replaceChildren();
    // textContent (not innerHTML) keeps user input from injecting markup.
    items.forEach((item, index) => {
      const li = document.createElement('li');

      const course = document.createElement('div');
      course.className = 'entry-course';
      course.textContent = item.course;

      const meta = document.createElement('div');
      meta.className = 'entry-meta';
      meta.textContent = `${displayName(item)} on ${new Date(item.date).toLocaleString()}`;

      const text = document.createElement('p');
      text.className = 'entry-text';
      text.textContent = item.feedback;

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'link-btn delete-btn';
      del.dataset.index = String(index);
      del.textContent = 'Delete';

      li.append(course, meta, text, del);
      list.append(li);
    });
    count.textContent = `(${items.length})`;
    emptyMsg.hidden = items.length > 0;
    clearBtn.hidden = items.length === 0;
    exportBtn.hidden = items.length === 0;
  };

  const showPanel = (signedIn) => {
    loginForm.hidden = signedIn;
    panel.hidden = !signedIn;
    if (signedIn) render();
  };

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (loginForm.passcode.value === ADMIN_PASSCODE) {
      loginError.hidden = true;
      loginForm.reset();
      setSignedIn(true);
      showPanel(true);
    } else {
      loginError.textContent = 'Wrong passcode. Check it and try again.';
      loginError.hidden = false;
    }
  });

  logoutBtn.addEventListener('click', () => {
    setSignedIn(false);
    showPanel(false);
  });

  list.addEventListener('click', (event) => {
    const btn = event.target.closest('.delete-btn');
    if (!btn) return;
    if (confirm('Delete this feedback entry?')) {
      const items = load();
      items.splice(Number(btn.dataset.index), 1);
      save(items);
      render();
    }
  });

  clearBtn.addEventListener('click', () => {
    if (confirm('Delete all submitted feedback?')) {
      save([]);
      render();
    }
  });

  exportBtn.addEventListener('click', () => {
    const blob = new Blob(['\ufeff' + toCsv(load())], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student-feedback.csv';
    link.click();
    URL.revokeObjectURL(url);
  });

  // Refresh when a new submission arrives from the form in another tab.
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY && isSignedIn()) render();
  });

  showPanel(isSignedIn());
}

if (typeof module !== 'undefined') {
  module.exports = { csvCell, toCsv, displayName };
}
