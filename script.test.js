const test = require('node:test');
const assert = require('node:assert');
const { validateFeedback } = require('./script.js');

const valid = { name: 'Asha', course: 'Data Structures', feedback: 'Great pacing and clear examples.' };

test('accepts complete feedback', () => {
  assert.deepStrictEqual(validateFeedback(valid), []);
});

test('rejects a missing name', () => {
  assert.strictEqual(validateFeedback({ ...valid, name: '  ' }).length, 1);
});

test('rejects a missing course', () => {
  assert.strictEqual(validateFeedback({ ...valid, course: '' }).length, 1);
});

test('rejects feedback that is too short', () => {
  assert.strictEqual(validateFeedback({ ...valid, feedback: 'ok' }).length, 1);
});

test('reports every problem at once', () => {
  assert.strictEqual(validateFeedback({ name: '', course: '', feedback: '' }).length, 3);
});
