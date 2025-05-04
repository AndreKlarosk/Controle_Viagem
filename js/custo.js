// js/custo.js
// CRUD de gastos extras para o app Controle de Viagens

import { add, getAll } from './db.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formGasto');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const data = new FormData(form);
    const viagemId = parseInt(data.get('viagemId'), 10);
    const tipo = data.get('tipo');
    const valor = parseFloat(data.get('valor'));
    const descricao = data.get('descricao');
    // Processar comprovante
    let comprovanteData = null;
    const file = data.get('comprovante');
    if (file && file.size > 0) {
      comprovanteData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = err => reject(err);
        reader.readAsDataURL(file);
      });
    }
    const gasto = {
      viagemId,
      tipo,
      valor,
      descricao,
      dataHora: new Date().toISOString(),
      comprovante: comprovanteData
    };
    await add('gastosExtras', gasto);
    form.reset();
    loadGastos();
  });
});

// Carrega e exibe lista de gastos extras da viagem selecionada
async function loadGastos() {
  const viagemSelect = document.querySelector('section#gastos select[name="viagemId"]');
  const viagemId = parseInt(viagemSelect.value, 10);
  const lista = document.getElementById('listaGastos');
  lista.innerHTML = '';
  if (!viagemId) return;
  const all = await getAll('gastosExtras');
  const registros = all.filter(g => g.viagemId === viagemId);
  registros.forEach(g => {
    const item = document.createElement('div');
    item.innerHTML = `
      <strong>${new Date(g.dataHora).toLocaleString()}</strong>: [${g.tipo}] R$ ${g.valor.toFixed(2)}
      <br>${g.descricao || '-'}
    `;
    if (g.comprovante) {
      const img = document.createElement('img');
      img.src = g.comprovante;
      img.alt = 'Comprovante';
      img.style.maxWidth = '100px';
      item.appendChild(img);
    }
    lista.appendChild(item);
  });
}

// Expondo função para app.js
window.loadGastos = async () => {
  await window.loadViagens();
  loadGastos();
};
