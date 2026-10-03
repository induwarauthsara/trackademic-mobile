/** Accept a code only at the callback URL we initiated, never an arbitrary deep link. */
export function getOAuthCode(url: string, expected: string): string {
  const actual = new URL(url);
  const redirect = new URL(expected);
  if (actual.protocol !== redirect.protocol || actual.host !== redirect.host || actual.pathname !== redirect.pathname) {
    throw new Error('Unexpected authentication redirect.');
  }
  if (actual.searchParams.has('error')) throw new Error('Google sign-in was not completed.');
  const code = actual.searchParams.get('code');
  if (!code) throw new Error('Authentication callback has no code.');
  return code;
}
