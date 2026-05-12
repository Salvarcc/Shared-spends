import { getNombre, getPersonas, getGastos, crearGrupo, agregarPersona, eliminarPersona, agregarGasto, loadStateObj, getGrupoActivo } from './state.js';
import { saveState, loadState, clearState } from './storage.js';
import { getState } from './state.js';

const AVATAR_COLORS = ['a', 'b', 'c', 'd'];
function avatarClass(idx) { return `avatar--${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`; }

function guardar() {
  saveState(getState());
}

function renderPersonas() {
  const lista    = document.getElementById('lista-integrantes');
  const personas = getPersonas();
  if (!lista) return;

  if (!getGrupoActivo()) {
    lista.innerHTML = `<div class="empty-state"><div class="empty-state__icon">👥</div><p class="empty-state__text">Crea un grupo primero.</p></div>`;
    return;
  }

  if (personas.length === 0) {
    lista.innerHTML = `<div class="empty-state"><div class="empty-state__icon">👥</div><p class="empty-state__text">Agrega al menos 2 personas para comenzar.</p></div>`;
    return;
  }

  lista.innerHTML = personas.map((p, i) => `
    <div class="integrante-item">
      <div class="integrante-item__info">
        <span class="avatar ${avatarClass(i)}">${p[0].toUpperCase()}</span>
        <span>${p}</span>
      </div>
      <button class="integrante-item__delete" data-nombre="${p}">✕</button>
    </div>
  `).join('');

  lista.querySelectorAll('[data-nombre]').forEach(btn => {
    btn.addEventListener('click', () => {
      eliminarPersona(btn.dataset.nombre);
      guardar();
      renderPersonas();
      renderCheckboxes();
      actualizarSelectPagador();
    });
  });
}

function renderCheckboxes() {
  const cont     = document.getElementById('checkboxes-divide');
  const personas = getPersonas();
  if (!cont) return;

  if (personas.length === 0) {
    cont.innerHTML = '<p class="field-error visible">Agrega integrantes primero.</p>';
    return;
  }

  cont.innerHTML = personas.map(p => `
    <label class="checkbox-label">
      <input type="checkbox" name="divide" value="${p}" checked />
      <span>${p}</span>
    </label>
  `).join('');
}

function actualizarSelectPagador() {
  const select   = document.getElementById('select-pagador');
  const personas = getPersonas();
  if (!select) return;
  select.innerHTML = `<option value="">Seleccionar pagador</option>` +
    personas.map(p => `<option value="${p}">${p}</option>`).join('');
}

function actualizarNombreGrupo() {
  const span = document.getElementById('nombre-grupo-header');
  if (span) span.textContent = getNombre() || '—';
}

function showError(el, msg) {
  clearError(el);
  const err = document.createElement('p');
  err.className = 'field-error visible';
  err.textContent = msg;
  err.dataset.errorFor = 'true';
  el.parentNode.appendChild(err);
  el.classList.add('error');
}

function clearError(el) {
  const prev = el.parentNode.querySelector('[data-error-for]');
  if (prev) prev.remove();
  el.classList.remove('error');
}

function handleCrearGrupo() {
  const input  = document.getElementById('input-nombre-grupo');
  const btn    = document.getElementById('btn-crear-grupo');
  const nombre = input.value.trim();

  if (!nombre) { showError(input, 'Escribe un nombre para el grupo.'); return; }

  const res = crearGrupo(nombre);
  if (!res.ok) { showError(input, res.msg); return; }

  guardar();
  actualizarNombreGrupo();
  input.value = '';
  clearError(input);
  renderPersonas();
  renderCheckboxes();
  actualizarSelectPagador();

  btn.textContent = '✓ Creado';
  btn.disabled = true;
  setTimeout(() => { btn.textContent = 'Crear'; btn.disabled = false; }, 1500);
}

function handleAgregarPersona() {
  if (!getGrupoActivo()) { alert('Crea un grupo primero.'); return; }
  const input = document.getElementById('input-integrante');
  const res   = agregarPersona(input.value);
  if (!res.ok) { showError(input, res.msg); return; }
  clearError(input);
  input.value = '';
  guardar();
  renderPersonas();
  renderCheckboxes();
  actualizarSelectPagador();
}

function handleRegistrarGasto(e) {
  e.preventDefault();
  if (!getGrupoActivo()) { alert('Crea un grupo primero.'); return; }
  let valido = true;

  const desc       = document.getElementById('input-desc');
  const monto      = document.getElementById('input-monto');
  const pagador    = document.getElementById('select-pagador');
  const checkboxes = [...document.querySelectorAll('input[name="divide"]:checked')];

  if (!desc.value.trim())              { showError(desc,   'Escribe una descripción.'); valido = false; } else clearError(desc);
  if (!monto.value || +monto.value<=0) { showError(monto,  'El monto debe ser mayor a 0.'); valido = false; } else clearError(monto);
  if (!pagador.value)                  { showError(pagador, 'Selecciona quién pagó.'); valido = false; } else clearError(pagador);
  if (!checkboxes.length)              { showError(document.getElementById('checkboxes-divide'), 'Selecciona al menos una persona.'); valido = false; }

  if (!valido) return;

  const res = agregarGasto({
    descripcion:   desc.value,
    monto:         +monto.value,
    pagadoPor:     pagador.value,
    divididoEntre: checkboxes.map(c => c.value)
  });

  if (!res.ok) { alert(res.msg); return; }

  guardar();
  e.target.reset();
  renderCheckboxes();
  alert('✅ Gasto registrado. Ve al Dashboard para ver los balances.');
}

function init() {
  const saved = loadState();
  if (saved === 'CORRUPTED') {
    clearState();
  } else if (saved) {
    loadStateObj(saved);
  }

  actualizarNombreGrupo();
  renderPersonas();
  renderCheckboxes();
  actualizarSelectPagador();

  document.getElementById('btn-crear-grupo').onclick     = handleCrearGrupo;
  document.getElementById('btn-agregar-persona').onclick = handleAgregarPersona;
  document.getElementById('input-integrante').onkeydown  = e => { if (e.key === 'Enter') handleAgregarPersona(); };
  document.getElementById('form-gasto').onsubmit         = handleRegistrarGasto;
}

document.addEventListener('DOMContentLoaded', init);