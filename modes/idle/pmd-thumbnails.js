/* Lightweight, pre-rendered Mystery Dungeon portraits for existing image slots. */
window.IDLE_PMD_THUMBNAIL = (() => {
  function source(id, shiny = false, form = 0, fallback = '') {
    const key = String(id).padStart(4, '0') + (form ? '/' + String(form).padStart(4, '0') : '');
    const images = window.IDLE_PMD_THUMBNAILS;
    const image = images[key + (shiny ? 's' : '')] || images[key];
    return image ? 'data:image/webp;base64,' + image : fallback;
  }

  function fromLegacy(url) {
    const match = typeof url === 'string' && url.match(/\/sprites\/pokemon\/(?:[\w-]+\/)*(\d+)\.(?:gif|png)$/);
    if (!match) return url;
    const id = Number(match[1]);
    const mega = window.IDLE_MEGA_DEFS?.find(entry => entry.sprite === id);
    const special = {10001:[386,1],10002:[386,2],10003:[386,3],10013:[351,1],10014:[351,2],10015:[351,3]}[id];
    return source(mega?.id || special?.[0] || id, url.includes('/shiny/'), mega?.form || special?.[1] || 0, url);
  }

  function member(pokemon, lines, fallback = '') {
    const {id, shiny, form} = window.IDLE_PMD_PORTRAITS.identity(pokemon, lines);
    return source(id, shiny, form, fallback);
  }

  return {source, fromLegacy, member};
})();
