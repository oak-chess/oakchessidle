import { createAccessTokenVerifier } from './verify-access-token.mjs';

export function createChatAuthenticator(projectUrl, publishableKey) {
  const verify = createAccessTokenVerifier(projectUrl, publishableKey);
  const profiles = new URL('/rest/v1/profiles', projectUrl);
  profiles.searchParams.set('select', 'id,username');

  return async token => {
    const id = await verify(token);
    if (!id) return null;
    // Read expiry only after Supabase verifies this exact access token.
    const claims = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
    if (claims.sub !== id || !Number.isSafeInteger(claims.exp)) return null;

    const endpoint = new URL(profiles);
    endpoint.searchParams.set('id', 'eq.' + id);
    const response = await fetch(endpoint, {
      headers: { apikey: publishableKey, Authorization: 'Bearer ' + token },
      redirect: 'error',
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) return null;
    const [profile] = await response.json();
    return profile?.id === id ? { id, username: profile.username, expiresAt: claims.exp * 1000 } : null;
  };
}
