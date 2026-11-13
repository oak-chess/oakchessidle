(() => {
  const currentRelease = document.currentScript.dataset.release;
  let checking = false;
  let deadline = 0;
  let reloading = false;

  function reload() {
    if (reloading) return;
    reloading = true;
    location.reload();
  }

  function notify() {
    deadline = Date.now() + 30000;
    const notice = document.createElement('aside');
    notice.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:2147483647;display:flex;align-items:center;gap:12px;padding:12px;max-width:calc(100vw - 24px);border:1px solid #63daed;border-radius:8px;background:#102735;color:#fff;font:14px system-ui;box-shadow:0 4px 16px #0008';
    const message = document.createElement('span');
    message.setAttribute('role', 'status');
    message.textContent = 'Nova versão disponível.';
    const countdown = document.createElement('span');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Atualizar agora';
    button.style.cssText = 'padding:8px;color:#08232c;background:#8de6f4;border:0;border-radius:4px;cursor:pointer';
    button.addEventListener('click', reload);
    notice.append(message, countdown, button);
    document.body.append(notice);
    function tick() {
      const seconds = Math.ceil((deadline - Date.now()) / 1000);
      if (seconds <= 0) return reload();
      countdown.textContent = 'Atualização automática em ' + seconds + ' s';
    }
    tick();
    setInterval(tick, 250);
  }

  async function check() {
    if (checking || deadline || document.hidden) return;
    checking = true;
    try {
      const response = await fetch('/game-version.json', {
        cache: 'no-store',
        signal: AbortSignal.timeout(8000)
      });
      if (!response.ok) return;
      const { release } = await response.json();
      if (/^[a-f0-9]{40}$/.test(release) && release !== currentRelease) notify();
    } catch {
      // A temporary network failure is retried on the next check.
    } finally {
      checking = false;
    }
  }

  document.addEventListener('visibilitychange', check);
  setInterval(check, 60000);
  void check();
})();
