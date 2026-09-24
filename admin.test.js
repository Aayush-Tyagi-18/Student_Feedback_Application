const test = require('node:test');
const assert = require('node:assert');
const { csvCell, toCsv } = require('./admin.js');

test('csvCell doubles quotes and wraps the value', () => {
  assert.strictEqual(csvCell('say "hi"'), '"say ""hi"""');
});

test('csvCell neutralises spreadsheet formulas', () => {
  assert.strictEqual(csvCell('=1+1'), `"'=1+1"`);
});

test('toCsv writes a header and one row per entry', () => {
  const csv = toCsv([{ date: '2026-09-24', name: 'Asha', course: 'DSA', feedback: 'Great, clear' }]);
  const lines = csv.split('\r\n');
  assert.strictEqual(lines[0], '"Date","Name","Course","Feedback"');
  assert.strictEqual(lines[1], '"2026-09-24","Asha","DSA","Great, clear"');
});
