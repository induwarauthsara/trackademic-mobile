import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getOAuthCode } from '../src/lib/oauth';

const redirect = 'trackademic:///auth/callback';
test('native and web PKCE callbacks return the authorization code', () => {
  assert.equal(getOAuthCode(`${redirect}?code=valid`, redirect), 'valid');
  assert.equal(getOAuthCode('http://localhost:8081/auth/callback?code=web', 'http://localhost:8081/auth/callback'), 'web');
});
test('wrong origin, host, or route cannot exchange a code', () => {
  for (const url of ['other:///auth/callback?code=a', 'trackademic://evil/auth/callback?code=a', 'trackademic:///another?code=a']) {
    assert.throws(() => getOAuthCode(url, redirect), /Unexpected/);
  }
  assert.throws(() => getOAuthCode('https://evil.test/auth/callback?code=a', 'https://trackademic.com/auth/callback'));
});
test('expired, rejected, and implicit token callbacks are not accepted as PKCE codes', () => {
  assert.throws(() => getOAuthCode(`${redirect}?error=access_denied&code=a`, redirect));
  assert.throws(() => getOAuthCode(`${redirect}#access_token=token`, redirect));
  assert.throws(() => getOAuthCode(`${redirect}?code=`, redirect));
});
