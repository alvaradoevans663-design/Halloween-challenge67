'use strict';
/* ===== Datos de los retos (edítalos aquí) ===== */
const RETOS = [
  { t: 'La casa más terrorífica', d: 'Encuentra una casa con tres decoraciones diferentes de Halloween y demuestra que las encontraste.' },
  { t: 'Gemelos del terror', d: 'Encuentra a dos personas con disfraces del mismo personaje o de personajes parecidos.' },
  { t: 'Voz del más allá', d: 'Haz una voz monstruosa durante 10 segundos sin reírte. El organizador puede validarlo en persona.', fotoOpcional: true },
  { t: 'Colección de colores', d: 'Consigue cinco dulces de cinco colores diferentes.' },
  { t: 'Cazafantasmas', d: 'Encuentra a alguien disfrazado de fantasma y a otra persona disfrazada de esqueleto.' },
  { t: 'La búsqueda naranja', d: 'Encuentra cuatro calabazas decorativas en casas diferentes.' },
  { t: 'Puerta misteriosa', d: 'Encuentra una puerta decorada con telarañas, una calabaza y un esqueleto.' },
  { t: 'La noche de los monstruos', d: 'Encuentra tres disfraces diferentes entre vampiro, bruja, zombi y hombre lobo.' },
  { t: 'Detective de Halloween', d: 'Encuentra tres casas diferentes: una con una calabaza, otra con un esqueleto y otra con luces moradas.' }
];

/* ===== Estado y almacenamiento local ===== */
const KEY = 'halloween-challenge-v1', ACTIVE = 'halloween-challenge-active';
let S = load();
S.timers = S.timers || {};
let me = localStorage.getItem(ACTIVE);
let cur = 0, photo = null, isOrg = false, winnerShown = false;
const $ = id => document.getElementById(id);

function load() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.players) return s; } catch (e) {}
  return { players: [], subs: [], winners: {}, timers: {}, pin: null, finished: false };
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); return true; }
  catch (e) { toast('No hay espacio para guardar. Prueba con una foto más pequeña.'); return false; }
}
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const player = id => S.players.find(p => p.id === id);
const subOf = (pid, cid) => S.subs.find(s => s.pid === pid && s.cid === cid && s.status !== 'no');
const fmt = ms => { const t = Math.floor(ms / 1000), m = Math.floor(t / 60); return String(m).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); };
const tkey = () => me + ':' + cur;
const validated = s => s.status === 'ok' || s.status === 'late';
const points = pid => Object.values(S.winners).filter(w => w === pid).length;

/* ===== Mensajes y celebración ===== */
let tt;
function toast(msg) { const t = $('toast'); t.textContent = msg; t.hidden = false; clearTimeout(tt); tt = setTimeout(() => t.hidden = true, 2800); }
function celebrate(title, text, ms = 3800, sticky = false) {
  $('cTitle').textContent = title; $('cText').textContent = text;
  const box = $('celebrate'); box.hidden = false;
  box.querySelectorAll('.fall').forEach(n => n.remove());
  ['🎃', '👻', '🦇', '🍬', '🕸️', '💀'].forEach(e => { for (let i = 0; i < 6; i++) {
    const f = document.createElement('span'); f.className = 'fall'; f.textContent = e;
    f.style.left = Math.random() * 100 + '%'; f.style.animationDuration = 2 + Math.random() * 2.5 + 's'; f.style.animationDelay = Math.random() * 1.5 + 's';
    box.appendChild(f); } });
  box.onclick = () => box.hidden = true;
  if (!sticky) setTimeout(() => box.hidden = true, ms);
}

/* ===== Interfaz principal ===== */
function render() {
  const won = Object.keys(S.winners).length;
  $('statDone').textContent = won + '/9';
  $('statMine').textContent = me ? points(me) : 0;
  const w = $('whoami');
  w.hidden = !player(me);
  if (player(me)) w.innerHTML = 'Jugando como <b>' + esc(player(me).name) + '</b> · <a href="#" id="chg" style="color:var(--orange)">cambiar</a>';
  $('game').hidden = !player(me);
  renderGame(); renderBoard();
  if ((won === 9 || S.finished) && !winnerShown) { winnerShown = true; showWinner(); }
}
function status(cid) {
  const s = subOf(me, cid);
  if (S.winners[cid] === me) return 'won';
  if (s) return 'sent';
  return '';
}
function renderGame() {
  if (!player(me)) return;
  const r = RETOS[cur], cid = cur;
  $('rNum').textContent = 'Reto ' + (cid + 1) + ' de 9';
  $('rTitle').textContent = r.t; $('rDesc').textContent = r.d;
  $('dots').innerHTML = RETOS.map((_, i) => '<button class="' + [i === cid ? 'cur' : '', status(i)].join(' ') + '" data-i="' + i + '" aria-label="Reto ' + (i + 1) + '">' + (i + 1) + '</button>').join('');
  const s = subOf(me, cid), wid = S.winners[cid];
  let msg = '';
  if (wid === me) msg = '🏆 ¡Ganaste este punto!';
  else if (s && s.status === 'late') msg = '✅ Validado, pero ' + esc(player(wid).name) + ' llegó antes.';
  else if (s) msg = '⏳ Enviado. Esperando al organizador.';
  else if (wid) msg = '🔒 ' + esc(player(wid).name) + ' ya ganó este reto. Puedes enviarlo igualmente.';
  const prev = S.subs.find(x => x.pid === me && x.cid === cid && x.status === 'no');
  if (prev && !s) msg = '❌ Prueba rechazada. Inténtalo de nuevo.';
  $('rState').innerHTML = msg;
  $('photoBox').hidden = !!s; $('btnComplete').disabled = !!s;
  $('photoLabel').textContent = '📷 Adjuntar foto de prueba' + (r.fotoOpcional ? ' (opcional)' : '');
  $('preview').hidden = !photo || !!s; if (photo) $('preview').src = photo;
  const best = S.subs.filter(x => x.cid === cid && validated(x) && x.time != null).sort((a, b) => a.time - b.time)[0];
  $('rBest').textContent = best ? '🥇 Mejor tiempo: ' + fmt(best.time) + ' (' + player(best.pid).name + ')' : '';
  $('btnTimer').hidden = !!s; $('btnTimer').textContent = S.timers[tkey()] ? '⏱️ Corriendo…' : '⏱️ Iniciar cronómetro'; $('btnTimer').disabled = !!S.timers[tkey()];
  tick();
  $('btnPrev').disabled = cid === 0; $('btnNext').disabled = cid === 8;
}
function renderBoard() {
  const list = S.players.map(p => ({ p, pts: points(p.id), sent: S.subs.filter(s => s.pid === p.id).length,
      time: S.subs.filter(s => s.pid === p.id && S.winners[s.cid] === p.id && s.status === 'ok').reduce((a, s) => a + (s.time || 0), 0) }))
    .sort((a, b) => b.pts - a.pts || (a.time || 1e12) - (b.time || 1e12) || a.p.name.localeCompare(b.p.name));
  $('board').innerHTML = list.length
    ? list.map((x, i) => '<li><span>' + ['🥇', '🥈', '🥉'][i] + ' ' + (i > 2 ? (i + 1) + '. ' : '') + esc(x.p.name) + '</span><span><b>' + x.pts + ' pts</b> <em>' + (x.pts ? '⏱️ ' + fmt(x.time) + ' en total' : '(' + x.sent + ' enviados)') + '</em></span></li>').join('')
    : '<li>Aún no hay participantes. ¡Pulsa COMENZAR!</li>';
}
function showWinner() {
  const max = Math.max(0, ...S.players.map(p => points(p.id)));
  if (!max) return;
  const names = S.players.filter(p => points(p.id) === max).map(p => p.name);
  celebrate('🎃 ¡Tenemos ganador!', (names.length > 1 ? 'Empate entre ' : '') + names.join(' y ') + ' con ' + max + ' puntos', 0, true);
}

/* ===== Participantes ===== */
function openName() {
  $('existing').innerHTML = S.players.map(p => '<button type="button" data-id="' + p.id + '">' + esc(p.name) + '</button>').join('');
  $('inName').value = ''; $('dlgName').showModal(); $('inName').focus();
}
$('formName').addEventListener('submit', () => {
  const name = $('inName').value.trim().slice(0, 20); if (!name) return;
  let p = S.players.find(x => x.name.toLowerCase() === name.toLowerCase());
  if (!p) { p = { id: uid(), name }; S.players.push(p); save(); }
  setMe(p.id);
});
$('existing').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { $('dlgName').close(); setMe(b.dataset.id); } });
function setMe(id) { me = id; localStorage.setItem(ACTIVE, id); photo = null; render(); $('game').scrollIntoView(); }

/* ===== Foto (se reduce para ahorrar espacio) ===== */
$('photoInput').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const img = new Image(), url = URL.createObjectURL(f);
  img.onload = () => {
    const k = Math.min(1, 640 / Math.max(img.width, img.height)), c = document.createElement('canvas');
    c.width = img.width * k; c.height = img.height * k; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    photo = c.toDataURL('image/jpeg', 0.6); URL.revokeObjectURL(url); renderGame();
  };
  img.onerror = () => toast('No se pudo leer la imagen.');
  img.src = url;
});

/* ===== Cronómetro ===== */
function tick() {
  if (!player(me)) return;
  const s = subOf(me, cur), st = S.timers[tkey()];
  $('tClock').textContent = s ? (s.time != null ? fmt(s.time) : '--:--') : st ? fmt(Date.now() - st) : '00:00';
  document.querySelector('.timer').classList.toggle('run', !!st && !s);
}
setInterval(tick, 500);
$('btnTimer').onclick = () => { if (!S.timers[tkey()] && !subOf(me, cur)) { S.timers[tkey()] = Date.now(); save(); renderGame(); } };

/* ===== Acciones del jugador ===== */
$('btnStart').onclick = () => player(me) ? $('game').scrollIntoView() : openName();
document.addEventListener('click', e => {
  if (e.target.id === 'chg') { e.preventDefault(); openName(); }
  const d = e.target.closest('#dots button'); if (d) { cur = +d.dataset.i; photo = null; renderGame(); }
});
$('btnPrev').onclick = () => { cur = Math.max(0, cur - 1); photo = null; renderGame(); };
$('btnNext').onclick = () => { cur = Math.min(8, cur + 1); photo = null; renderGame(); };
$('btnComplete').onclick = () => {
  if (subOf(me, cur)) return;
  if (!S.timers[tkey()]) return toast('Inicia el cronómetro antes de completar el reto.');
  if (!photo && !RETOS[cur].fotoOpcional) return toast('Adjunta una foto como prueba.');
  S.subs = S.subs.filter(s => !(s.pid === me && s.cid === cur));
  const time = Date.now() - S.timers[tkey()];
  S.subs.push({ id: uid(), pid: me, cid: cur, photo, ts: Date.now(), time, status: 'pending' });
  if (!save()) { S.subs.pop(); return; }
  delete S.timers[tkey()]; save();
  photo = null; $('photoInput').value = ''; toast('¡Enviado! El organizador lo revisará.');
  if (cur < 8) cur++; render();
};

/* ===== Organizador ===== */
$('btnOrg').onclick = () => { $('dlgOrg').showModal(); isOrg ? orgPanel() : orgLogin(); };
$('orgClose').onclick = () => $('dlgOrg').close();
function orgLogin() {
  $('orgBody').innerHTML = '<h3>Modo organizador</h3><p>' + (S.pin ? 'Introduce tu PIN.' : 'Crea un PIN para validar pruebas.') +
    '</p><input type="password" id="pin" inputmode="numeric" maxlength="8" placeholder="PIN"><button class="btn" id="pinOk" style="width:100%">Entrar</button>';
  $('pinOk').onclick = () => {
    const v = $('pin').value.trim(); if (v.length < 3) return toast('Mínimo 3 caracteres.');
    if (!S.pin) { S.pin = v; save(); } else if (S.pin !== v) return toast('PIN incorrecto.');
    isOrg = true; orgPanel();
  };
}
function orgPanel() {
  const pend = S.subs.filter(s => s.status === 'pending').sort((a, b) => a.ts - b.ts);
  $('orgBody').innerHTML = '<h3>Pruebas pendientes (' + pend.length + ')</h3>' + (pend.map(s =>
    '<div class="sub-item"><b>' + esc(player(s.pid).name) + '</b> · Reto ' + (s.cid + 1) + ': ' + esc(RETOS[s.cid].t) + '<br>⏱️ Tiempo: ' + (s.time != null ? fmt(s.time) : '—') +
    (S.winners[s.cid] ? '<br><em>Ya ganado por ' + esc(player(S.winners[s.cid]).name) + '</em>' : '') +
    (s.photo ? '<img src="' + s.photo + '" alt="Prueba">' : '<p>Sin foto</p>') +
    '<div class="row"><button class="btn ok" data-a="ok" data-id="' + s.id + '">Validar</button><button class="btn no" data-a="no" data-id="' + s.id + '">Rechazar</button></div></div>').join('') || '<p>No hay pruebas por revisar.</p>') +
    '<div class="org-actions"><button class="btn ghost" id="oFin">🏁 Finalizar y mostrar ganador</button><button class="btn ghost" id="oRes">🗑️ Reiniciar todo</button></div>';
  $('orgBody').querySelectorAll('[data-a]').forEach(b => b.onclick = () => review(b.dataset.id, b.dataset.a));
  $('oFin').onclick = () => { S.finished = true; save(); $('dlgOrg').close(); render(); };
  $('oRes').onclick = () => { if (confirm('¿Borrar jugadores, pruebas y puntos?')) { const pin = S.pin; S = { players: [], subs: [], winners: {}, timers: {}, pin, finished: false }; winnerShown = false; me = null; localStorage.removeItem(ACTIVE); save(); $('dlgOrg').close(); render(); } };
}
function review(id, act) {
  const s = S.subs.find(x => x.id === id); if (!s) return;
  if (act === 'no') { s.status = 'no'; s.photo = null; }
  else if (!S.winners[s.cid]) { s.status = 'ok'; S.winners[s.cid] = s.pid; save(); render(); celebrate('¡Punto para ' + player(s.pid).name + '!', RETOS[s.cid].t); }
  else { s.status = 'late'; toast('Validado sin punto: el reto ya tenía ganador.'); }
  save(); render(); orgPanel();
}

/* Si otra pestaña del mismo navegador cambia los datos, se actualiza */
window.addEventListener('storage', e => { if (e.key === KEY) { S = load(); S.timers = S.timers || {}; render(); } });
render();
