import { getNombre, getGrupos, getPersonas, getGastos, setGrupoActivo, eliminarGasto, loadStateObj, getGrupoActivo } from './state.js';
import { saveState, loadState, clearState } from './storage.js';
import { calcularBalances, calcularTransferencias } from './balance.js';
import { getState } from './state.js';

/* ──────────────────────────────────────────────
   1. CONSTANTES / HELPERS
─────────────────────────────────────────────── */

const CHART_COLORS = [
  '#00ffc8', '#ff5252', '#a78bfa', '#ffb74d', '#40c4ff',
  '#f48fb1', '#00e676', '#ff9800', '#e040fb', '#00bcd4',
];

const AVATAR_COLORS = ['a', 'b', 'c', 'd'];
function avatarClass(idx) { return `avatar--${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`; }

function getEmoji(desc) {
  const d = desc.toLowerCase();
  // Comida
  if (d.includes('cena')     || d.includes('comida')    || d.includes('desayuno') || d.includes('almuerzo')) return '🍽️';
  if (d.includes('cafe')     || d.includes('starbucks') || d.includes('cafeteria')) return '☕';
  
  // Transporte y Viajes
  if (d.includes('taxi')     || d.includes('uber')      || d.includes('cabify'))   return '🚕';
  if (d.includes('avion')    || d.includes('vuelo')     || d.includes('aeropuerto')) return '✈️';
  if (d.includes('bus')      || d.includes('pasaje')    || d.includes('tren'))     return '🚌';
  if (d.includes('gasolina') || d.includes('gas')       || d.includes('grifo'))    return '⛽';
  if (d.includes('hotel')    || d.includes('hostal')    || d.includes('airbnb'))   return '🏨';
  if (d.includes('playa')    || d.includes('viaje')     || d.includes('turismo'))  return '🏖️';

  // Compras y Hogar
  if (d.includes('super')    || d.includes('mercado')   || d.includes('bodega'))   return '🛒';
  if (d.includes('ropa')     || d.includes('zapatos')   || d.includes('mall'))     return '👕';
  if (d.includes('casa')     || d.includes('hogar')     || d.includes('mueble'))   return '🏠';
  if (d.includes('celular')  || d.includes('laptop')    || d.includes('tech'))     return '💻';

  // Ocio y Bebidas
  if (d.includes('cerve')    || d.includes('bar')       || d.includes('trago'))    return '🍺';
  if (d.includes('cine')     || d.includes('pelicula')  || d.includes('netflix'))  return '🎬';
  if (d.includes('fiesta')   || d.includes('evento')    || d.includes('concierto')) return '🎉';
  if (d.includes('gym')      || d.includes('deporte')   || d.includes('futbol'))   return '⚽';

  // Otros
  if (d.includes('farmacia') || d.includes('medicina')  || d.includes('doctor'))   return '💊';
  if (d.includes('regalo')   || d.includes('detalle')   || d.includes('cumple'))   return '🎁';
  if (d.includes('mascota')  || d.includes('perro')     || d.includes('gato'))     return '🐾';

  return '💳';
}

function guardar() {
  saveState(getState());
}

/* ──────────────────────────────────────────────
   2. RENDERIZADO
─────────────────────────────────────────────── */

function renderGrupos() {
  const cont = document.getElementById('grupos-container');
  const grupos = getGrupos();
  const activo = getState().grupoActivo;

  if (!cont) return;

  if (grupos.length === 0) {
    cont.innerHTML = `<div class="empty-state"><div class="empty-state__icon">📁</div><p class="empty-state__text">No hay grupos creados.</p></div>`;
    return;
  }

  cont.innerHTML = grupos.map((g, i) => `
    <div class="grupo-tab ${i === activo ? 'grupo-tab--activo' : ''}" data-idx="${i}">
      <span class="grupo-tab__name">${g.nombre}</span>
      <span class="grupo-tab__count">${g.gastos.length} gastos</span>
    </div>
  `).join('');

  cont.querySelectorAll('.grupo-tab').forEach(tab => {
    tab.onclick = () => {
      setGrupoActivo(parseInt(tab.dataset.idx));
      guardar();
      refreshAll();
    };
  });
}

function renderBalancesYTransferencias() {
  const bCont = document.getElementById('balances-container');
  const tCont = document.getElementById('transferencias-container');
  const personas = getPersonas();
  const gastos = getGastos();

  if (!bCont || !tCont) return;

  if (personas.length === 0) {
    bCont.innerHTML = `<p class="empty-state__text py-4">Agrega integrantes para ver balances.</p>`;
    tCont.innerHTML = `<p class="empty-state__text py-4">Sin integrantes.</p>`;
    return;
  }

  const balances = calcularBalances(personas, gastos);
  const transfers = calcularTransferencias(balances);

  // Balances
  bCont.innerHTML = personas.map((p, i) => {
    const m = balances[p];
    const colorClass = m > 0 ? 'balance-item__amount--positive' : (m < 0 ? 'balance-item__amount--negative' : 'balance-item__amount--neutral');
    const sign = m > 0 ? '+' : '';
    return `
      <div class="balance-item">
        <div class="balance-item__person">
          <div class="avatar ${avatarClass(i)}">${p[0].toUpperCase()}</div>
          <span class="balance-item__name">${p}</span>
        </div>
        <span class="balance-item__amount ${colorClass}">${sign}S/ ${m.toFixed(2)}</span>
      </div>
    `;
  }).join('');

  // Transferencias
  if (transfers.length === 0) {
    tCont.innerHTML = `<div class="transfers-settled">✨ Todos están al día</div>`;
  } else {
    tCont.innerHTML = `
      <div class="transfer-list">
        ${transfers.map(t => `
          <div class="transfer-item">
            <div class="transfer-item__route">
              <span class="transfer-item__from">${t.de}</span>
              <span class="transfer-item__arrow">→</span>
              <span class="transfer-item__to">${t.para}</span>
            </div>
            <span class="transfer-item__amount">S/ ${t.monto.toFixed(2)}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
}

function renderGastos() {
  const cont = document.getElementById('gastos-container');
  const gastos = getGastos();

  if (!cont) return;

  if (gastos.length === 0) {
    cont.innerHTML = `<div class="empty-state"><div class="empty-state__icon">💸</div><p class="empty-state__text">Aún no hay gastos registrados.</p></div>`;
    renderDonut([]); // Limpiar donut
    return;
  }

  cont.innerHTML = `
    <div class="gastos-list">
      ${gastos.map(g => `
        <div class="gasto-card">
          <div class="gasto-card__left">
            <div class="gasto-card__emoji">${getEmoji(g.descripcion)}</div>
            <div class="gasto-card__info">
              <div class="gasto-card__desc">${g.descripcion}</div>
              <div class="gasto-card__meta">
                Pagado por <strong>${g.pagadoPor}</strong> · ${new Date(g.fecha).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div class="gasto-card__right">
            <div class="gasto-card__amount">S/ ${g.monto.toFixed(2)}</div>
            <button class="btn-eliminar" data-id="${g.id}">Eliminar</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  cont.querySelectorAll('.btn-eliminar').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      Swal.fire({
        title: '¿Eliminar este gasto?',
        text: "Esta acción no se puede deshacer.",
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
          eliminarGasto(id);
          guardar();
          refreshAll();
          Swal.fire({
            title: "¡Eliminado!",
            icon: "success",
            draggable: true,
            background: '#161b22',
            color: '#fff'
          });
        }
      });
    };
  });

  // Actualizar Donut
  renderDonut(gastos);
}

function actualizarNombreGrupo() {
  const el = document.getElementById('nombre-grupo-header');
  if (el) el.textContent = getNombre() || 'Sin grupo activo';
}

function refreshAll() {
  actualizarNombreGrupo();
  renderGrupos();
  renderBalancesYTransferencias();
  renderGastos();
}

/* ──────────────────────────────────────────────
   3. DONUT CHART
─────────────────────────────────────────────── */

let donutChart = null;

window.renderDonut = function (gastos) {
  const wrap     = document.getElementById('chart-wrap');
  const empty    = document.getElementById('chart-empty');
  const totalEl  = document.getElementById('donut-total');
  const legendEl = document.getElementById('chart-legend');
  const canvas   = document.getElementById('donut-chart');

  if (!gastos || !gastos.length) {
    if (wrap)  wrap.style.display  = 'none';
    if (empty) empty.style.display = 'block';
    return;
  }

  const map = {};
  gastos.forEach(g => {
    map[g.descripcion] = (map[g.descripcion] || 0) + g.monto;
  });

  const labels = Object.keys(map);
  const data   = labels.map(k => map[k]);
  const total  = data.reduce((a, b) => a + b, 0);
  const colors = labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);

  if (totalEl) totalEl.textContent = 'S/ ' + total.toFixed(2);

  if (legendEl) {
    legendEl.innerHTML = labels.map((lbl, i) => {
      const pct = total > 0 ? ((map[lbl] / total) * 100).toFixed(1) : 0;
      return `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;
                    padding:8px 12px;border-radius:8px;background:#0d111780;border:1px solid #21262d;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="width:10px;height:10px;border-radius:50%;background:${colors[i]};
                         flex-shrink:0;box-shadow:0 0 6px ${colors[i]}80;"></span>
            <span style="font-size:13px;font-weight:600;color:#e2e8f0;">${getEmoji(lbl)} ${lbl}</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
            <span style="font-size:12px;color:#7a8fa0;font-family:'Space Mono',monospace;">${pct}%</span>
            <span style="font-size:13px;font-weight:700;color:${colors[i]};font-family:'Space Mono',monospace;">
              S/ ${map[lbl].toFixed(2)}
            </span>
          </div>
        </div>`;
    }).join('');
  }

  if (donutChart) donutChart.destroy();

  donutChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor:     colors.map(c => c + '30'),
        borderColor:         colors,
        borderWidth:         2,
        hoverBackgroundColor: colors.map(c => c + '50'),
        hoverBorderWidth:    3,
      }],
    },
    options: {
      cutout: '72%',
      animation: { animateRotate: true, duration: 800 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#161b22',
          borderColor:     '#21262d',
          borderWidth:     1,
          titleColor:      '#e2e8f0',
          bodyColor:       '#90a4ae',
          titleFont: { family: "'Space Grotesk'", weight: '600', size: 13 },
          bodyFont:  { family: "'Space Mono'",    size: 12 },
          callbacks: {
            label: ctx => ` S/ ${ctx.parsed.toFixed(2)} (${((ctx.parsed / total) * 100).toFixed(1)}%)`,
          },
        },
      },
    },
  });

  if (wrap)  wrap.style.display  = 'flex';
  if (empty) empty.style.display = 'none';
};

/* ──────────────────────────────────────────────
   4. EXPORTAR PDF
─────────────────────────────────────────────── */

function getGastosExportData() {
  const gastos = getGastos();
  return gastos.map(g => ({
    descripcion: g.descripcion,
    pagadoPor: g.pagadoPor,
    fecha: new Date(g.fecha).toLocaleDateString(),
    monto: g.monto
  }));
}

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const grupo = getNombre() || 'Grupo';
  const rows  = getGastosExportData();
  const total = rows.reduce((s, r) => s + r.monto, 0);
  const fecha = new Date().toLocaleDateString('es-PE', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  doc.setFillColor(13, 17, 23);
  doc.rect(0, 0, 210, 38, 'F');
  doc.setTextColor(0, 255, 200);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Agenda de Gastos', 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(144, 164, 174);
  doc.text(grupo.toUpperCase(), 14, 23);
  doc.text('Reporte generado: ' + fecha, 14, 29);

  doc.autoTable({
    startY: 46,
    head:   [['Descripción', 'Pagado por', 'Fecha', 'Monto (S/)']],
    body:   rows.map(r => [r.descripcion, r.pagadoPor, r.fecha, r.monto.toFixed(2)]),
    foot:   [['', '', 'TOTAL', total.toFixed(2)]],
    headStyles:          { fillColor: [0, 104, 95], textColor: 255, fontStyle: 'bold', fontSize: 10 },
    footStyles:          { fillColor: [13, 17, 23], textColor: [0, 255, 200], fontStyle: 'bold', fontSize: 10 },
    bodyStyles:          { fontSize: 10, textColor: [30, 30, 30] },
    alternateRowStyles:  { fillColor: [240, 248, 246] },
    columnStyles:        { 3: { halign: 'right' } },
    margin: { left: 14, right: 14 },
    theme:  'grid',
  });

  doc.save('gastos-' + grupo.replace(/\s+/g, '-').toLowerCase() + '.pdf');
}

/* ──────────────────────────────────────────────
   5. EXPORTAR EXCEL
─────────────────────────────────────────────── */

function exportExcel() {
  const grupo = getNombre() || 'Grupo';
  const rows  = getGastosExportData();
  const total = rows.reduce((s, r) => s + r.monto, 0);

  const wsData = [
    ['Agenda de Gastos — ' + grupo],
    ['Reporte generado:', new Date().toLocaleDateString('es-PE')],
    [],
    ['Descripción', 'Pagado por', 'Fecha', 'Monto (S/)'],
    ...rows.map(r => [r.descripcion, r.pagadoPor, r.fecha, r.monto]),
    [],
    ['', '', 'TOTAL', total],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols']   = [{ wch: 28 }, { wch: 16 }, { wch: 18 }, { wch: 14 }];
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Gastos');
  XLSX.writeFile(wb, 'gastos-' + grupo.replace(/\s+/g, '-').toLowerCase() + '.xlsx');
}

/* ──────────────────────────────────────────────
   6. INIT
─────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  const saved = loadState();
  if (saved === 'CORRUPTED') {
    clearState();
  } else if (saved) {
    loadStateObj(saved);
  }

  refreshAll();

  document.getElementById('btn-export-pdf')?.addEventListener('click', exportPDF);
  document.getElementById('btn-export-excel')?.addEventListener('click', exportExcel);
  
  document.getElementById('btn-nuevo-grupo')?.addEventListener('click', () => {
    window.location.href = '../index.html#nuevo';
  });
});