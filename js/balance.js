export function calcularBalances(personas, gastos) {
  const balances = {};
  personas.forEach(p => { balances[p] = 0; });

  gastos.forEach(({ monto, pagadoPor, divididoEntre }) => {
    if (!divididoEntre.length) return;
    const parte = monto / divididoEntre.length;
    if (balances[pagadoPor] !== undefined) balances[pagadoPor] += monto;
    divididoEntre.forEach(p => {
      if (balances[p] !== undefined) balances[p] -= parte;
    });
  });

  Object.keys(balances).forEach(p => {
    balances[p] = Math.round(balances[p] * 100) / 100;
  });

  return balances;
}

export function calcularTransferencias(balances) {
  const deudores   = [];
  const acreedores = [];

  Object.entries(balances).forEach(([persona, monto]) => {
    if (monto < -0.005) deudores.push({ persona, monto: -monto });
    if (monto >  0.005) acreedores.push({ persona, monto });
  });

  deudores.sort((a, b) => b.monto - a.monto);
  acreedores.sort((a, b) => b.monto - a.monto);

  const transferencias = [];

  while (deudores.length && acreedores.length) {
    const deudor   = deudores[0];
    const acreedor = acreedores[0];
    const monto    = Math.min(deudor.monto, acreedor.monto);
    transferencias.push({ de: deudor.persona, para: acreedor.persona, monto: Math.round(monto * 100) / 100 });
    deudor.monto   -= monto;
    acreedor.monto -= monto;
    if (deudor.monto   < 0.005) deudores.shift();
    if (acreedor.monto < 0.005) acreedores.shift();
  }

  return transferencias;
}