/**
 * Archivo: panel.js
 * Descripción: Lógica funcional para la aplicación de Agenda de Gastos.
 * Maneja la creación de grupos, gestión de integrantes y registro de gastos.
 */

// --- Selección de elementos del DOM ---

// Grupo
const inputNombreGrupo = document.querySelector('#input-nombre-grupo');
const btnCrearGrupo = document.querySelector('#btn-crear-grupo');
const nombreGrupoHeader = document.querySelector('#nombre-grupo-header');

// Integrantes
const inputIntegrante = document.querySelector('#input-integrante');
const btnAgregarPersona = document.querySelector('#btn-agregar-persona');
const listaIntegrantes = document.querySelector('#lista-integrantes');
const selectPagador = document.querySelector('#select-pagador');
const checkboxesDivide = document.querySelector('#checkboxes-divide');

// Gastos
const formGasto = document.querySelector('#form-gasto');
const inputDesc = document.querySelector('#input-desc');
const inputMonto = document.querySelector('#input-monto');

// --- Estado de la aplicación ---
// Se inicializa con datos de localStorage o valores por defecto
let nombreGrupo = localStorage.getItem('nombreGrupo') || 'Sin grupo activo';
let integrantes = JSON.parse(localStorage.getItem('integrantes')) || [];
let gastos = JSON.parse(localStorage.getItem('gastos')) || [];

// --- Funciones de Inicialización ---

/**
 * Carga los datos iniciales en la interfaz al abrir la página.
 */
function inicializarApp() {
    actualizarInterfazGrupo();
    actualizarInterfazIntegrantes();
}

// --- Lógica de Grupo ---

/**
 * Actualiza el nombre del grupo en la interfaz y en el almacenamiento local.
 */
function crearGrupo() {
    const nombre = inputNombreGrupo.value.trim();
    
    if (nombre === '') {
        alert('Por favor, ingresa un nombre para el grupo.');
        return;
    }

    nombreGrupo = nombre;
    localStorage.setItem('nombreGrupo', nombreGrupo);
    
    actualizarInterfazGrupo();
    inputNombreGrupo.value = ''; // Limpiar input
}

function actualizarInterfazGrupo() {
    if (nombreGrupoHeader) {
        nombreGrupoHeader.textContent = nombreGrupo;
    }
}

// --- Lógica de Integrantes ---

/**
 * Agrega un nuevo integrante a la lista y actualiza la persistencia.
 */
function agregarIntegrante() {
    const nombre = inputIntegrante.value.trim();

    if (nombre === '') {
        alert('Ingresa el nombre del integrante.');
        return;
    }

    if (integrantes.includes(nombre)) {
        alert('Este integrante ya existe.');
        return;
    }

    integrantes.push(nombre);
    localStorage.setItem('integrantes', JSON.stringify(integrantes));
    
    actualizarInterfazIntegrantes();
    inputIntegrante.value = ''; // Limpiar input
}

/**
 * Refresca la lista visual de integrantes y los selectores de gastos.
 */
function actualizarInterfazIntegrantes() {
    // 1. Actualizar lista visual (opcional según el HTML, pero recomendado)
    if (listaIntegrantes) {
        listaIntegrantes.innerHTML = '';
        integrantes.forEach(nombre => {
            const span = document.createElement('span');
            span.className = 'badge-integrante'; // Asumiendo una clase de estilo
            span.textContent = nombre;
            span.style.marginRight = '5px';
            span.style.padding = '5px 10px';
            span.style.background = '#eee';
            span.style.borderRadius = '15px';
            span.style.display = 'inline-block';
            listaIntegrantes.appendChild(span);
        });
    }

    // 2. Actualizar el select de "¿Quién pagó?"
    if (selectPagador) {
        selectPagador.innerHTML = '<option value="">Seleccionar pagador</option>';
        integrantes.forEach(nombre => {
            const option = document.createElement('option');
            option.value = nombre;
            option.textContent = nombre;
            selectPagador.appendChild(option);
        });
    }

    // 3. Actualizar los checkboxes de "¿Entre quiénes se divide?"
    if (checkboxesDivide) {
        checkboxesDivide.innerHTML = '';
        integrantes.forEach(nombre => {
            const label = document.createElement('label');
            label.className = 'checkbox-item';
            label.innerHTML = `
                <input type="checkbox" name="divide" value="${nombre}" checked>
                <span>${nombre}</span>
            `;
            checkboxesDivide.appendChild(label);
        });
    }
}

// --- Lógica de Gastos ---

/**
 * Registra un nuevo gasto y lo guarda en localStorage.
 */
function registrarGasto(e) {
    e.preventDefault(); // Evitar que el formulario recargue la página

    const descripcion = inputDesc.value.trim();
    const monto = parseFloat(inputMonto.value);
    const pagador = selectPagador.value;

    // Obtener quiénes participan en el gasto
    const checks = document.querySelectorAll('input[name="divide"]:checked');
    const participan = Array.from(checks).map(cb => cb.value);

    // Validaciones básicas
    if (!descripcion || isNaN(monto) || monto <= 0 || !pagador) {
        alert('Por favor, completa todos los campos correctamente.');
        return;
    }

    if (participan.length === 0) {
        alert('Debes seleccionar al menos una persona para dividir el gasto.');
        return;
    }

    // Crear objeto de gasto
    const nuevoGasto = {
        id: Date.now(),
        descripcion,
        monto,
        pagador,
        participan,
        fecha: new Date().toLocaleDateString()
    };

    // Guardar en el array y en localStorage
    gastos.push(nuevoGasto);
    localStorage.setItem('gastos', JSON.stringify(gastos));

    // Feedback al usuario y reset
    alert('¡Gasto registrado con éxito!');
    formGasto.reset();
    actualizarInterfazIntegrantes(); // Para resetear checkboxes si es necesario
}

// --- Event Listeners ---

// Evento para crear grupo
btnCrearGrupo.addEventListener('click', crearGrupo);

// Evento para agregar integrante
btnAgregarPersona.addEventListener('click', agregarIntegrante);

// Evento para enviar formulario de gasto
formGasto.addEventListener('submit', registrarGasto);

// Ejecutar inicialización al cargar el DOM
document.addEventListener('DOMContentLoaded', inicializarApp);
