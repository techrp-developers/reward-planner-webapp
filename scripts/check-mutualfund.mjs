import assert from 'node:assert/strict';
import { calculate, sipValue } from '../src/modules/services/mutualfund/web/calculations.ts';
import { normalizeMutualFundImageUrl as normalize } from '../src/api/mutualFundImages.ts';

const input = { amount: 5000, rate: 12, years: 10, extra: 2, existing: 0 };
assert.equal(sipValue(5000, 0, 10), 600000);
assert.ok(Math.abs(sipValue(5000, 12, 10) - 1161695.38) < 1);
assert.equal(calculate('cost_delay', { ...input, extra: 0 }).value, 0);
assert.equal(calculate('smart_goal', { ...input, existing: 1000000 }).value, 0);
assert.equal(calculate('lumpsum', { ...input, rate: 0 }).value, 5000);
assert.equal(calculate('stepup_sip', { ...input, extra: 0 }).value.toFixed(4), sipValue(5000, 12, 10).toFixed(4));
assert.equal(calculate('swp', { ...input, amount: 100000, rate: 0, extra: 1000 }).value, 0);
for (const kind of ['sip', 'goal_sip', 'smart_goal', 'inflation', 'cost_delay', 'lumpsum', 'retirement', 'stepup_sip', 'swp']) {
  assert.ok(Number.isFinite(calculate(kind, input).value), kind);
  assert.ok(Number.isFinite(calculate(kind, { ...input, rate: 0 }).value), `${kind} at zero rate`);
}

const valid = 'https://cdn.rewardplanners.com/public/mf-articles/27/thumbnail.png?v=2026-07-14%2012%3A30%3A42';
assert.equal(normalize(`https://cdn.rewardplanners.com/${valid}`), valid);
assert.equal(normalize(`https://cdn.rewardplanners.com/https://cdn.rewardplanners.com/${valid}`), valid);
for (const unchanged of [valid, 'public/image.png', 'https://example.com/https://example.com/image.png', 'https://cdn.rewardplanners.com/https://example.com/image.png', 'http://cdn.rewardplanners.com/http://cdn.rewardplanners.com/image.png']) {
  assert.equal(normalize(unchanged), unchanged);
}
assert.equal(normalize(null), null);
assert.equal(normalize(''), null);
console.log('Passed: nine calculators, zero-rate and withdrawal boundaries, known CDN repair, preserved valid/unrelated URLs and query strings.');
