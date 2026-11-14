(() => {
  let active = false;
  window.confirmIdleAction = (message, title = 'Confirmar ação', action = 'Confirmar') => {
    if (active) return Promise.resolve(false);
    const opener = document.activeElement;
    const dialog = document.createElement('dialog');
    dialog.className = 'idle-confirm';
    dialog.setAttribute('aria-labelledby', 'idle-confirm-title');
    dialog.setAttribute('aria-describedby', 'idle-confirm-message');
    const translate = text => window.IDLE_I18N?.translate(text) || text;
    dialog.innerHTML = '<form method="dialog"><h2 id="idle-confirm-title"></h2><p id="idle-confirm-message"></p><footer><button value="cancel" autofocus></button><button value="confirm"></button></footer></form>';
    dialog.querySelector('h2').textContent = translate(title);
    dialog.querySelector('p').textContent = translate(message);
    dialog.querySelector('[value=cancel]').textContent = translate('Cancelar');
    dialog.querySelector('[value=confirm]').textContent = translate(action);
    active = true;
    document.body.append(dialog);
    return new Promise(resolve => {
      dialog.addEventListener('close', () => {
        const accepted = dialog.returnValue === 'confirm';
        dialog.remove();
        active = false;
        if (opener?.isConnected) opener.focus({preventScroll:true});
        resolve(accepted);
      }, {once:true});
      dialog.showModal();
    });
  };
})();
