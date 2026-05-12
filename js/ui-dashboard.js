import { getNombre, getPersonas, getGastos, eliminarGasto, loadStateObj, getGrupos, setGrupoActivo, getGrupoActivo } from './state.js';
import { loadState, clearState, saveState } from './storage.js';
import { calcularBalances, calcularTransferencias } from './balance.js';
import { getState } from './state.js';

const EMOJIS = ['🍽️','🚕','🏨','🛒','🎉','⛽','🎬','🍺','✈️','🏖️'];

function getEmoji(desc) {
  const d = desc.toLowerCase();
  if (d.includes('cena') || d.includes('comida'))   return '🍽️';
  if (d.includes('taxi') || d.includes('uber'))     return '🚕';
  if (d.includes('hotel')|| d.includes('hostal'))   return '🏨';
  if (d.includes('super')|| d.includes('mercado'))  return '🛒';
  if (d.includes('gasolina')|| d.includes('gas'))   return '⛽';
  if (d.includes('cine') || d.includes('pelicula')) return '🎬';
  if (d.includes('cerve')|| d.includes('bar'))      return '🍺';
  if (d.includes('avion')|| d.includes('vuelo'))    return '✈️';
  if (d.includes('playa')|| d.includes('viaje'))    return '🏖️';
  return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
}

const AVATAR_COLORS = ['a', 'b', 'c', 'd'];
function avatarClass(idx) { return `avatar--${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`; }

function guardar() { saveState(getState()); }

function renderGrupos() {
  const cont   = document.getElementById('grupos-container');
  const grupos = getGrupos();
  if (!cont) return;

  if (!grupos.length) {
    cont.innerHTML = `<div class="empty-state"><div class="empty-state__icon">📋</div><p class="empty-state__text">No hay grupos creados aún.</p></div>`;
    return;
  }

  cont.innerHTML = grupos.map((g, i) => {
    const activo = getGrupoActivo() === g;
    return `
      <button class="grupo-tab ${activo ? 'grupo-tab--activo' : ''}" data-idx="${i}">
        ${g.nombre}
        <span class="grupo-tab__count">${g.gastos.length} gastos</span>
      </button>`;
  }).join('');

  cont.querySelectorAll('.grupo-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      setGrupoActivo(+btn.dataset.idx);
      guardar();
      renderAll();
    });
  });
}

function renderBalances() {
  const cont     = document.getElementById('balances-container');
  const personas = getPersonas();
  const gastos   = getGastos();
  if (!cont) return;

  if (!getGrupoActivo()) {
    cont.innerHTML = `<div class="empty-state"><div class="empty-state__icon">📊</div><p class="empty-state__text">Selecciona un grupo para ver balances.</p></div>`;
    return;
  }

  if (!personas.length) {
    cont.innerHTML = `<div class="empty-state"><div class="empty-state__icon">📊</div><p class="empty-state__text">No hay integrantes en este grupo.</p></div>`;
    return;
  }

  const balances = calcularBalances(personas, gastos);

  cont.innerHTML = personas.map((p, i) => {
    const b = balances[p];
    let cls, signo;
    if (b > 0.005)       { cls = 'balance-item__amount--positive'; signo = '+'; }
    else if (b < -0.005) { cls = 'balance-item__amount--negative'; signo = '−'; }
    else                 { cls = 'balance-item__amount--neutral';   signo = ''; }
    return `
      <div class="balance-item">
        <div class="balance-item__person">
          <span class="avatar ${avatarClass(i)}">${p[0].toUpperCase()}</span>
          <span class="balance-item__name">${p}</span>
        </div>
        <span class="balance-item__amount ${cls}">${signo} S/ ${Math.abs(b).toFixed(2)}</span>
      </div>`;
  }).join('');
}

function renderTransferencias() {
  const cont     = document.getElementById('transferencias-container');
  const personas = getPersonas();
  const gastos   = getGastos();
  if (!cont) return;

  if (!getGrupoActivo() || !personas.length || !gastos.length) {
    cont.innerHTML = `<div class="empty-state"><div class="empty-state__icon">🔄</div><p class="empty-state__text">Sin transferencias aún.</p></div>`;
    return;
  }

  const transf = calcularTransferencias(calcularBalances(personas, gastos));

  if (!transf.length) {
    cont.innerHTML = `<div class="transfers-settled">¡Grupo saldado! 🎉</div>`;
    return;
  }

  cont.innerHTML = `<ul class="transfer-list">` +
    transf.map(t => `
      <li class="transfer-item">
        <div class="transfer-item__route">
          <span class="transfer-item__from">${t.de}</span>
          <span class="transfer-item__arrow">→</span>
          <span class="transfer-item__to">${t.para}</span>
        </div>
        <span class="transfer-item__amount">S/ ${t.monto.toFixed(2)}</span>
      </li>`).join('') +
  `</ul>`;
}

function renderGastos() {
  const cont   = document.getElementById('gastos-container');
  const gastos = getGastos();
  if (!cont) return;

  if (!getGrupoActivo()) {
    cont.innerHTML = `<div class="empty-state"><div class="empty-state__icon">📋</div><p class="empty-state__text">Selecciona un grupo.</p></div>`;
    return;
  }

  if (!gastos.length) {
    cont.innerHTML = `<div class="empty-state"><div class="empty-state__icon">📋</div><p class="empty-state__text">Aún no hay gastos registrados.</p></div>`;
    return;
  }

  cont.innerHTML = `<div class="gastos-list">` +
    gastos.map(g => `
      <div class="gasto-card">
        <div class="gasto-card__left">
          <div class="gasto-card__emoji">${getEmoji(g.descripcion)}</div>
          <div class="gasto-card__info">
            <div class="gasto-card__desc">${g.descripcion}</div>
            <div class="gasto-card__meta">Pagado por <strong>${g.pagadoPor}</strong> · ${formatDate(g.fecha)}</div>
          </div>
        </div>
        <div class="gasto-card__right">
          <span class="gasto-card__amount">S/ ${g.monto.toFixed(2)}</span>
          <button class="btn-eliminar" data-id="${g.id}">Eliminar</button>
        </div>
      </div>`).join('') +
  `</div>`;

  cont.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('¿Eliminar este gasto?')) return;
      eliminarGasto(btn.dataset.id);
      guardar();
      renderAll();
    });
  });
}

function renderNombreGrupo() {
  const h1   = document.getElementById('group-title');
  const span = document.getElementById('nombre-grupo-header');
  const nombre = getNombre() || 'Selecciona un grupo';
  if (h1)   h1.textContent   = nombre;
  if (span) span.textContent = nombre;
}

function renderAll() {
  renderNombreGrupo();
  renderGrupos();
  renderBalances();
  renderTransferencias();
  renderGastos();
}

function init() {
  const saved = loadState();
  if (saved === 'CORRUPTED') {
    clearState();
  } else if (saved) {
    loadStateObj(saved);
  }

  renderAll();

  const btnNuevo = document.getElementById('btn-nuevo-grupo');
  if (btnNuevo) btnNuevo.onclick = () => { window.location.href = '../index.html'; };
}

document.addEventListener('DOMContentLoaded', init);