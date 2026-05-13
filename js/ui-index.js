import { getNombre, getPersonas, getGastos, crearGrupo, agregarPersona, eliminarPersona, agregarGasto, loadStateObj, getGrupoActivo, desactivarGrupo } from './state.js';
import { saveState, loadState, clearState } from './storage.js';
import { getState } from './state.js';

const AVATAR_COLORS = ['a', 'b', 'c', 'd'];
function avatarClass(idx) { return `avatar--${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`; }

function guardar() {
  saveState(getState());
}

function actualizarBloqueoSecciones() {
  const activo = getGrupoActivo();
  const sIntegrantes = document.getElementById('section-integrantes');
  const sGasto = document.getElementById('section-registrar-gasto');

  if (activo) {
    sIntegrantes?.classList.remove('section-disabled');
    sGasto?.classList.remove('section-disabled');
  } else {
    sIntegrantes?.classList.add('section-disabled');
    sGasto?.classList.add('section-disabled');
  }
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

  lista.querySelectorAll('.integrante-item__delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const nombre = btn.dataset.nombre;
      Swal.fire({
        title: `¿Eliminar a ${nombre}?`,
        text: "Se perderán sus registros en este grupo.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff5252',
        cancelButtonColor: '#21262d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        background: '#161b22',
        color: '#fff'
      }).then((result) => {
        if (result.isConfirmed) {
          eliminarPersona(nombre);
          guardar();
          renderPersonas();
          renderCheckboxes();
          actualizarSelectPagador();
          Swal.fire({
            title: "¡Eliminado!",
            icon: "success",
            draggable: true,
            background: '#161b22',
            color: '#fff'
          });
        }
      });
    });
  });
}

function renderCheckboxes() {
  const cont     = document.getElementById('checkboxes-divide');
  const personas = getPersonas();
  if (!cont) return;

  if (personas.length === 0) {
    cont.innerHTML = '';
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
  if (span) span.textContent = getNombre() || 'Sin grupo activo';
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
  if (!el) return;
  const prev = el.parentNode?.querySelector('[data-error-for]');
  if (prev) prev.remove();
  el.classList.remove('error');
}

function handleCrearGrupo() {
  const input  = document.getElementById('input-nombre-grupo');
  const nombre = input.value.trim();

  if (!nombre) { showError(input, 'Escribe un nombre para el grupo.'); return; }

  const res = crearGrupo(nombre);
  if (!res.ok) { showError(input, res.msg); return; }

  guardar();
  actualizarNombreGrupo();
  input.value = '';
  clearError(input);
  
  actualizarBloqueoSecciones();
  renderPersonas();
  renderCheckboxes();
  actualizarSelectPagador();

  Swal.fire({
    title: "¡Grupo Creado!",
    text: `El grupo "${nombre}" está listo.`,
    icon: "success",
    draggable: true,
    background: '#161b22',
    color: '#fff'
  });
}

function handleAgregarPersona() {
  if (!getGrupoActivo()) {
    Swal.fire({
      title: "¡Atención!",
      text: "Crea un grupo primero.",
      icon: "info",
      background: '#161b22',
      color: '#fff'
    });
    return;
  }
  const input = document.getElementById('input-integrante');
  const nombre = input.value.trim();
  const res   = agregarPersona(nombre);
  if (!res.ok) { showError(input, res.msg); return; }
  clearError(input);
  input.value = '';
  guardar();
  renderPersonas();
  renderCheckboxes();
  actualizarSelectPagador();

  Swal.fire({
    title: "¡Integrante agregado!",
    text: `${nombre} se unió al grupo.`,
    icon: "success",
    draggable: true,
    background: '#161b22',
    color: '#fff'
  });
}

function handleRegistrarGasto(e) {
  e.preventDefault();
  if (!getGrupoActivo()) return;
  
  let valido = true;
  const desc       = document.getElementById('input-desc');
  const monto      = document.getElementById('input-monto');
  const pagador    = document.getElementById('select-pagador');
  const checkboxes = [...document.querySelectorAll('input[name="divide"]:checked')];

  if (!desc.value.trim())              { showError(desc,   'Escribe una descripción.'); valido = false; } else clearError(desc);
  if (!monto.value || +monto.value<=0) { showError(monto,  'El monto debe ser mayor a 0.'); valido = false; } else clearError(monto);
  if (!pagador.value)                  { showError(pagador, 'Selecciona quién pagó.'); valido = false; } else clearError(pagador);
  if (!checkboxes.length)              { 
    Swal.fire({ title: "Error", text: "Selecciona al menos una persona para dividir.", icon: "error", background: '#161b22', color: '#fff' });
    valido = false; 
  }

  if (!valido) return;

  const res = agregarGasto({
    descripcion:   desc.value,
    monto:         +monto.value,
    pagadoPor:     pagador.value,
    divididoEntre: checkboxes.map(c => c.value)
  });

  if (!res.ok) {
    Swal.fire({ title: "Error", text: res.msg, icon: "error", background: '#161b22', color: '#fff' });
    return;
  }

  guardar();
  e.target.reset();
  renderCheckboxes();
  
  Swal.fire({
    title: "¡Gasto registrado!",
    text: "El gasto se guardó correctamente.",
    icon: "success",
    draggable: true,
    background: '#161b22',
    color: '#fff'
  });
}

function refreshAll() {
  actualizarNombreGrupo();
  actualizarBloqueoSecciones();
  renderPersonas();
  renderCheckboxes();
  actualizarSelectPagador();
}

function handleNuevo() {
  desactivarGrupo();
  guardar();
  document.getElementById('input-nombre-grupo').value = '';
  refreshAll();
  Swal.fire({
    title: "Nuevo Grupo",
    text: "Ingresa el nombre del grupo para comenzar.",
    icon: "info",
    background: '#161b22',
    color: '#fff'
  });
}

function init() {
  const saved = loadState();
  if (saved === 'CORRUPTED') {
    clearState();
  } else if (saved) {
    loadStateObj(saved);
  }

  // Si venimos con el hash #nuevo, desactivamos el grupo actual
  if (window.location.hash === '#nuevo') {
    desactivarGrupo();
    window.location.hash = '';
  }

  refreshAll();

  document.getElementById('btn-crear-grupo').onclick     = handleCrearGrupo;
  document.getElementById('btn-agregar-persona').onclick = handleAgregarPersona;
  document.getElementById('input-integrante').onkeydown  = e => { if (e.key === 'Enter') handleAgregarPersona(); };
  document.getElementById('form-gasto').onsubmit         = handleRegistrarGasto;
  document.getElementById('btn-header-nuevo').onclick    = handleNuevo;
}

document.addEventListener('DOMContentLoaded', init);