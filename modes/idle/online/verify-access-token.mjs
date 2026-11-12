// Use the project's public key. The bearer token belongs to the current player.
export function createAccessTokenVerifier(projectUrl, publishableKey) {
  const endpoint = new URL('/auth/v1/user', projectUrl);
  if (endpoint.protocol !== 'https:' || !publishableKey?.startsWith('sb_publishable_')) {
    throw new TypeError('Configure the HTTPS Supabase URL and publishable key');
  }

  return async token => {
    const response = await fetch(endpoint, {
      headers: { apikey: publishableKey, Authorization: 'Bearer ' + token },
      redirect: 'error',
      signal: AbortSignal.timeout(5000)
    });
    if (response.status === 401 || response.status === 403) return null;
    if (!response.ok) throw new Error('Supabase session verification failed: ' + response.status);
    const user = await response.json();
    return typeof user.id === 'string' ? user.id : null;
  };
}
