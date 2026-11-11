// Keep requestId in memory for retries. The server also looks up any active
// encounter for the account, so refreshing does not need a local save.
export function createHuntClient(auth, baseUrl = globalThis.location?.origin) {
  async function send(action, body) {
    const { data, error } = await auth.getSession();
    if (error || !data?.session?.access_token) {
      throw new Error('Entre na sua conta para explorar.');
    }

    const response = await fetch(new URL('/api/hunts/' + action, baseUrl), {
      method: body === undefined ? 'GET' : 'POST',
      headers: {
        Authorization: 'Bearer ' + data.session.access_token,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' })
      },
      redirect: 'error',
      body: JSON.stringify(body)
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result) {
      throw new Error(result?.error || 'Não foi possível acessar a caçada.');
    }
    return result;
  }

  return {
    active() {
      return send('active');
    },
    start(huntKey, requestId) {
      return send('start', { huntKey, requestId });
    },
    finish(encounterId) {
      return send('finish', { encounterId });
    }
  };
}
