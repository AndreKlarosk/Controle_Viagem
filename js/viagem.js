// js/viagem.js
import { add, getAll, getById, updateItem } from './db.js';

let editingTripId = null;

// Submete formulário de iniciar/editar viagem
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formViagem');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = new FormData(form);

    // Monta objeto de viagem
    const viagem = {
      origem: data.get('origem'),
      destino: data.get('destino'),
      cliente: data.get('cliente'),
      tipoCarga: data.get('tipoCarga'),
      veiculoId: parseInt(data.get('veiculoId'), 10),
      kmInicial: parseFloat(data.get('kmInicial')),
      valorReceber: parseFloat(data.get('valorReceber')) || 0,
      // Se for edição, preserva dataSaida e encerrada
      dataSaida: editingTripId
        ? (await getById('viagens', editingTripId)).dataSaida
        : new Date().toISOString(),
      encerrada: false
    };

    if (editingTripId) {
      viagem.id = editingTripId;
      await updateItem('viagens', viagem);
      editingTripId = null;
      form.querySelector('button[type="submit"]').textContent = 'Iniciar Viagem';
    } else {
      await add('viagens', viagem);
    }

    form.reset();
    // Atualiza selects e muda para próxima aba
    window.loadViagensSelections();
    document.querySelector('[data-tab="abastecimentos"]').click();
  });
});

// Carrega viagens ativas (não encerradas) em todos os selects que usam viagemId
export async function loadViagensSelections() {
  const viagens = await getAll('viagens');
  const ativas = viagens.filter(v => !v.encerrada);
  document.querySelectorAll('select[name="viagemId"]').forEach(sel => {
    sel.innerHTML = '<option value="" disabled selected>Selecione a viagem</option>';
    ativas.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = `${v.origem} → ${v.destino} (${v.kmInicial} km)`;
      sel.appendChild(opt);
    });
  });
}

// Carrega uma viagem no formulário para edição
export async function loadTripForEdit(id) {
  const v = await getById('viagens', id);
  editingTripId = id;
  const form = document.getElementById('formViagem');
  form.elements['origem'].value = v.origem;
  form.elements['destino'].value = v.destino;
  form.elements['cliente'].value = v.cliente;
  form.elements['tipoCarga'].value = v.tipoCarga;
  form.elements['veiculoId'].value = v.veiculoId;
  form.elements['kmInicial'].value = v.kmInicial;
  form.elements['valorReceber'].value = v.valorReceber;
  form.querySelector('button[type="submit"]').textContent = 'Salvar Alterações';
  document.querySelector('[data-tab="nova-viagem"]').click();
}

// Torna disponíveis globalmente para relatorio.js
window.loadViagensSelections = loadViagensSelections;
window.loadTripForEdit      = loadTripForEdit;
