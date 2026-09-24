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
  const errorBox = document.getElementById('form-error');
  const successBox = document.getElementById('form-success');

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
    };
    const errors = validateFeedback(data);
    if (errors.length) {
      show(errorBox, errors.join(' '));
      return;
    }
    errorBox.hidden = true;

    const items = load();
    items.unshift({
      name: data.name.trim(),
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

    show(successBox, `Thank you, ${data.name.trim()}. Your feedback for ${data.course.trim()} was submitted.`);
    form.reset();
  });

  form.addEventListener('input', () => { successBox.hidden = true; });
}

if (typeof module !== 'undefined') {
  module.exports = { validateFeedback };
}
