let state = {
  grupos: [],
  grupoActivo: null
};

export function getState() { return state; }
export function getGrupos() { return state.grupos; }

export function getGrupoActivo() {
  if (state.grupoActivo === null || state.grupoActivo === undefined) return null;
  return state.grupos[state.grupoActivo] || null;
}

export function getPersonas() {
  const g = getGrupoActivo();
  return g ? g.personas : [];
}

export function getGastos() {
  const g = getGrupoActivo();
  return g ? g.gastos : [];
}

export function getNombre() {
  const g = getGrupoActivo();
  return g ? g.nombre : '';
}

export function crearGrupo(nombre) {
  const n = nombre.trim();
  if (!n) return { ok: false, msg: 'El nombre no puede estar vacío.' };
  const nuevo = { nombre: n, personas: [], gastos: [] };
  state.grupos.push(nuevo);
  state.grupoActivo = state.grupos.length - 1;
  return { ok: true };
}

export function setGrupoActivo(idx) {
  if (idx >= 0 && idx < state.grupos.length) {
    state.grupoActivo = idx;
  }
}

export function agregarPersona(nombre) {
  const g = getGrupoActivo();
  if (!g) return { ok: false, msg: 'No hay grupo activo.' };
  const n = nombre.trim();
  if (!n) return { ok: false, msg: 'El nombre no puede estar vacío.' };
  if (g.personas.some(p => p.toLowerCase() === n.toLowerCase()))
    return { ok: false, msg: 'Ya existe una persona con ese nombre.' };
  g.personas.push(n);
  return { ok: true };
}

export function eliminarPersona(nombre) {
  const g = getGrupoActivo();
  if (!g) return;
  g.personas = g.personas.filter(p => p !== nombre);
}

export function agregarGasto({ descripcion, monto, pagadoPor, divididoEntre }) {
  const g = getGrupoActivo();
  if (!g) return { ok: false, msg: 'No hay grupo activo.' };
  if (!descripcion || monto <= 0 || !pagadoPor || divididoEntre.length === 0)
    return { ok: false, msg: 'Datos del gasto incompletos o inválidos.' };

  const gasto = {
    id: Date.now().toString(),
    descripcion: descripcion.trim(),
    monto: parseFloat(monto),
    pagadoPor,
    divididoEntre,
    fecha: new Date().toISOString()
  };
  g.gastos.unshift(gasto);
  return { ok: true };
}

export function eliminarGasto(id) {
  const g = getGrupoActivo();
  if (!g) return;
  g.gastos = g.gastos.filter(x => x.id !== id);
}

export function loadStateObj(saved) {
  if (saved && Array.isArray(saved.grupos)) {
    state = saved;
  } else {
    state = { grupos: [], grupoActivo: null };
  }
}