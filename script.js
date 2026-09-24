const STORAGE_KEY = 'studentFeedback';

// Pure function, so it can be unit-tested in CI without a browser.
function validateFeedback({ name, course, feedback }) {
  const errors = [];
  if (!name || !name.trim()) errors.push('Enter your name.');
  if (!course || !course.trim()) errors.push('Enter your course.');
  if (!feedback || feedback.trim().length < 10) {
    errors.push('Write at least 10 characters of feedback.');
  }
  return errors;
}

if (typeof document !== 'undefined') {
  const form = document.getElementById('feedback-form');
  const list = document.getElementById('feedback-list');
  const errorBox = document.getElementById('form-error');
  const emptyMsg = document.getElementById('empty');
  const count = document.getElementById('count');
  const clearBtn = document.getElementById('clear-btn');

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
    } catch (e) { /* storage unavailable: entries last until page reload */ }
  };

  let items = load();

  const render = () => {
    list.replaceChildren();
    // textContent (not innerHTML) keeps user input from injecting markup.
    items.forEach((item) => {
      const li = document.createElement('li');

      const course = document.createElement('div');
      course.className = 'entry-course';
      course.textContent = item.course;

      const meta = document.createElement('div');
      meta.className = 'entry-meta';
      meta.textContent = `${item.name} on ${new Date(item.date).toLocaleString()}`;

      const text = document.createElement('p');
      text.className = 'entry-text';
      text.textContent = item.feedback;

      li.append(course, meta, text);
      list.append(li);
    });
    count.textContent = `(${items.length})`;
    emptyMsg.hidden = items.length > 0;
    clearBtn.hidden = items.length === 0;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = {
      name: form.name.value,
      course: form.course.value,
      feedback: form.feedback.value,
    };
    const errors = validateFeedback(data);
    if (errors.length) {
      errorBox.textContent = errors.join(' ');
      errorBox.hidden = false;
      return;
    }
    errorBox.hidden = true;
    items.unshift({
      name: data.name.trim(),
      course: data.course.trim(),
      feedback: data.feedback.trim(),
      date: new Date().toISOString(),
    });
    save(items);
    render();
    form.reset();
    form.name.focus();
  });

  clearBtn.addEventListener('click', () => {
    if (confirm('Delete all submitted feedback?')) {
      items = [];
      save(items);
      render();
    }
  });

  render();
}

if (typeof module !== 'undefined') {
  module.exports = { validateFeedback };
}
