const STORAGE_KEY = 'studentFeedback';

// Pure function, so it can be unit-tested in CI without a browser.
function validateFeedback({ name, course, feedback, anonymous }) {
  const errors = [];
  if (!anonymous && (!name || !name.trim())) errors.push('Enter your name, or tick "Submit anonymously".');
  if (!course || !course.trim()) errors.push('Enter your course.');
  if (!feedback || feedback.trim().length < 10) {
    errors.push('Write at least 10 characters of feedback.');
  }
  return errors;
}

if (typeof document !== 'undefined') {
  const form = document.getElementById('feedback-form');
  const errorBox = document.getElementById('form-error');
  const successBox = document.getElementById('form-success');
  const nameInput = document.getElementById('name');
  const anonBox = document.getElementById('anonymous');

  // Anonymous feedback: the name field is switched off and cleared, so it is never saved.
  const syncAnonymous = () => {
    if (anonBox.checked) nameInput.value = '';
    nameInput.disabled = anonBox.checked;
  };
  anonBox.addEventListener('change', syncAnonymous);

  const load = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  };

  const show = (box, message) => {
    box.textContent = message;
    box.hidden = false;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    successBox.hidden = true;

    const data = {
      name: form.name.value,
      course: form.course.value,
      feedback: form.feedback.value,
      anonymous: anonBox.checked,
    };
    const errors = validateFeedback(data);
    if (errors.length) {
      show(errorBox, errors.join(' '));
      return;
    }
    errorBox.hidden = true;

    const items = load();
    items.unshift({
      name: data.anonymous ? '' : data.name.trim(),
      anonymous: data.anonymous,
      course: data.course.trim(),
      feedback: data.feedback.trim(),
      date: new Date().toISOString(),
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      show(errorBox, 'Your browser blocked saving. Turn off private mode or allow site storage, then try again.');
      return;
    }

    const who = data.anonymous ? 'Thank you.' : `Thank you, ${data.name.trim()}.`;
    show(successBox, `${who} Your ${data.anonymous ? 'anonymous ' : ''}feedback for ${data.course.trim()} was submitted.`);
    form.reset();
    syncAnonymous();
  });

  form.addEventListener('input', () => { successBox.hidden = true; });
}

if (typeof module !== 'undefined') {
  module.exports = { validateFeedback };
}
