import { test } from 'node:test';
import assert from 'node:assert/strict';
import { uptime, wrap } from './build-assets.mjs';

test('wrap breaks on word boundaries within the limit', () => {
  assert.deepEqual(wrap('aa bb cc dd', 5), ['aa bb', 'cc dd']);
  assert.deepEqual(wrap('short', 20), ['short']);
});

test('uptime counts whole months since 2022-05-09 (UTC)', () => {
  assert.equal(uptime(new Date('2022-05-09T00:00:00Z')), '0y 0m');
  assert.equal(uptime(new Date('2026-11-08T23:59:59Z')), '4y 5m');
  assert.equal(uptime(new Date('2026-11-09T00:00:00Z')), '4y 6m');
  assert.equal(uptime(new Date('2027-05-09T00:00:00Z')), '5y 0m');
});
