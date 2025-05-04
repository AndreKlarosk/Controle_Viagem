// js/veiculo.js
// CRUD de veículos com edição e exclusão no app Controle de Viagens

import { add, getAll, deleteItem, updateItem, getById } from './db.js';

let editingVehicleId = null;

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formVeiculo');

  // Submete formulário para criar ou editar veículo
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const vehicle = {
      placa: data.get('placa'),
      modelo: data.get('modelo'),
      ano: parseInt(data.get('ano'), 10),
      combustivel: data.get('combustivel'),
      kmAtual: parseFloat(data.get('kmAtual')),
    };

    if (editingVehicleId) {
      vehicle.id = editingVehicleId;
      await updateItem('veiculos', vehicle);
      editingVehicleId = null;
      form.querySelector('button[type="submit"]').textContent = 'Salvar Caminhão';
    } else {
      await add('veiculos', vehicle);
    }

    form.reset();
    loadVeiculos();
    loadNovaViagem();
  });

  // Carrega e exibe a lista de veículos
  async function loadVeiculos() {
    const lista = document.getElementById('listaVeiculos');
    lista.innerHTML = '';
    const veiculos = await getAll('veiculos');

    veiculos.forEach((v) => {
      const item = document.createElement('div');
      item.className = 'veiculo-item';

      // Informação do veículo
      const info = document.createElement('span');
      info.textContent = `${v.placa} – ${v.modelo} (${v.ano}) – ${v.kmAtual} km`;
      item.appendChild(info);

      // Botão "Editar"
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Editar';
      editBtn.addEventListener('click', async () => {
        const veh = await getById('veiculos', v.id);
        form.elements['placa'].value = veh.placa;
        form.elements['modelo'].value = veh.modelo;
        form.elements['ano'].value = veh.ano;
        form.elements['combustivel'].value = veh.combustivel;
        form.elements['kmAtual'].value = veh.kmAtual;
        editingVehicleId = v.id;
        form.querySelector('button[type="submit"]').textContent = 'Salvar Alteração';
        document.querySelector('[data-tab="veiculos"]').click();
      });
      item.appendChild(editBtn);

      // Botão "Excluir"
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Excluir';
      delBtn.addEventListener('click', async () => {
        if (confirm('Deseja realmente excluir este veículo?')) {
          await deleteItem('veiculos', v.id);
          loadVeiculos();
          loadNovaViagem();
        }
      });
      item.appendChild(delBtn);

      lista.appendChild(item);
    });
  }

  // Popula dropdown de veículos na aba "Nova Viagem"
  async function loadNovaViagem() {
    const select = document.querySelector('section#nova-viagem select[name="veiculoId"]');
    select.innerHTML = '<option value="" disabled selected>Selecione o caminhão</option>';
    const veiculos = await getAll('veiculos');
    veiculos.forEach((v) => {
      const option = document.createElement('option');
      option.value = v.id;
      option.textContent = `${v.placa} – ${v.modelo}`;
      select.appendChild(option);
    });
  }

  // Inicializa as listagens
  loadVeiculos();
  loadNovaViagem();
});
