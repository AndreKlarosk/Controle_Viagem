// js/abastecimento.js
// CRUD de abastecimentos para o app Controle de Viagens

import { add, getAll } from './db.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formAbastecimento');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const data = new FormData(form);
    const viagemId = parseInt(data.get('viagemId'), 10);
    const litros = parseFloat(data.get('litros'));
    const valorLitro = parseFloat(data.get('valorLitro'));
    const total = parseFloat((litros * valorLitro).toFixed(2));
    // Ler comprovante como Base64, se houver
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
    const abastecimento = {
      viagemId,
      litros,
      valorLitro,
      total,
      posto: data.get('posto'),
      dataHora: new Date().toISOString(),
      comprovante: comprovanteData
    };
    await add('abastecimentos', abastecimento);
    form.reset();
    loadAbastecimentos();
  });
});

// Carrega e exibe lista de abastecimentos da viagem selecionada
async function loadAbastecimentos() {
  const viagemSelect = document.querySelector('section#abastecimentos select[name="viagemId"]');
  const viagemId = parseInt(viagemSelect.value, 10);
  const lista = document.getElementById('listaAbastecimentos');
  lista.innerHTML = '';
  if (!viagemId) return;
  const all = await getAll('abastecimentos');
  const registros = all.filter(a => a.viagemId === viagemId);
  registros.forEach(a => {
    const item = document.createElement('div');
    item.innerHTML = `
      <strong>${new Date(a.dataHora).toLocaleString()}</strong>: ${a.litros} L × R$ ${a.valorLitro.toFixed(2)} = R$ ${a.total.toFixed(2)}
      <br>Posto: ${a.posto || '-'}
    `;
    if (a.comprovante) {
      const img = document.createElement('img');
      img.src = a.comprovante;
      img.alt = 'Comprovante';
      img.style.maxWidth = '100px';
      item.appendChild(img);
    }
    lista.appendChild(item);
  });
}

// Expondo para app.js e atualização de selects
window.loadAbastecimentos = async () => {
  // atualiza opções de viagens
  await window.loadViagens();
  // exibe lista de abastecimentos, se já tiver viagem selecionada
  loadAbastecimentos();
};
