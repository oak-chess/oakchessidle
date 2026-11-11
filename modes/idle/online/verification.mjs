// Status comes from the authenticated server/database, never profile metadata.
export function appendVerification(label, kind) {
 if (!['official', 'verified'].includes(kind)) return;
 const badge = document.createElement('span');
 badge.className = 'chat-verified chat-verified-' + kind;
 badge.setAttribute('role', 'img');
 badge.setAttribute('aria-label', kind === 'official' ? 'Canal oficial verificado' : 'Jogador ou streamer verificado');
 badge.title = badge.getAttribute('aria-label');
 const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
 svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
 const seal = document.createElementNS(svg.namespaceURI, 'path');
 seal.setAttribute('d', 'M12 1.5 15 3l3.3.2 1.5 3 2.4 2.3-.6 3.5.6 3.5-2.4 2.3-1.5 3-3.3.2-3 1.5-3-1.5-3.3-.2-1.5-3-2.4-2.3.6-3.5-.6-3.5 2.4-2.3 1.5-3L9 3Z');
 seal.setAttribute('fill', 'currentColor');
 const check = document.createElementNS(svg.namespaceURI, 'path');
 check.setAttribute('d', 'm7.5 12 3 3 6-6'); check.setAttribute('fill', 'none');
 check.setAttribute('stroke', '#09202b'); check.setAttribute('stroke-width', '2.3');
 check.setAttribute('stroke-linecap', 'round'); check.setAttribute('stroke-linejoin', 'round');
 svg.append(seal, check); badge.append(svg); label.append(badge);
}
