// js/relatorio.js
// Geração de relatórios, export, edição e exclusão de viagens
import { getAll, deleteItem } from './db.js';

window.loadRelatorios = async function loadRelatorios() {
  const viagens      = await getAll('viagens');
  const abastecimentos = await getAll('abastecimentos');
  const gastosExtras   = await getAll('gastosExtras');
  const veiculos       = await getAll('veiculos');

  const container = document.getElementById('tabelaRelatorios');
  container.innerHTML = '';

  // Cria tabela e cabeçalho
  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>Origem</th>
        <th>Destino</th>
        <th>Cliente</th>
        <th>Tipo Carga</th>
        <th>Caminhão</th>
        <th>Data Saída</th>
        <th>KM Inicial</th>
        <th>Valor a Receber</th>
        <th>Total Abastecimento</th>
        <th>Total Gastos Extras</th>
        <th>Lucro</th>
      </tr>
    </thead>
  `;
  const tbody = document.createElement('tbody');

  viagens.forEach(v => {
    // Cálculo de totais
    const totalAbat = abastecimentos
      .filter(a => a.viagemId === v.id)
      .reduce((sum, a) => sum + a.total, 0);

    const totalGastos = gastosExtras
      .filter(g => g.viagemId === v.id)
      .reduce((sum, g) => sum + g.valor, 0);

    const lucro = (v.valorReceber || 0) - (totalAbat + totalGastos);

    // Dados do veículo
    const veic = veiculos.find(c => c.id === v.veiculoId) || {};

    // Linha da tabela
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${v.origem}</td>
      <td>${v.destino}</td>
      <td>${v.cliente || '-'}</td>
      <td>${v.tipoCarga || '-'}</td>
      <td>${veic.placa || ''}</td>
      <td>${new Date(v.dataSaida).toLocaleString()}</td>
      <td>${v.kmInicial}</td>
      <td>R$ ${v.valorReceber.toFixed(2)}</td>
      <td>R$ ${totalAbat.toFixed(2)}</td>
      <td>R$ ${totalGastos.toFixed(2)}</td>
      <td>R$ ${lucro.toFixed(2)}</td>
    `;
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  container.appendChild(table);

  // Lida com edição
  container.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id, 10);
      window.loadTripForEdit(id);
    });
  });

  // Lida com exclusão
  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = parseInt(btn.dataset.id, 10);
      if (confirm('Deseja realmente excluir esta viagem?')) {
        await deleteItem('viagens', id);
        loadRelatorios();
        window.loadViagensSelections();
      }
    });
  });
};

// Exporta CSV
document.getElementById('exportCsv').addEventListener('click', () => {
  const table = document.querySelector('#tabelaRelatorios table');
  if (!table) return;

  let csv = '';
  const headers = Array.from(table.querySelectorAll('thead th'))
    .map(th => th.textContent);
  csv += headers.join(',') + '\n';

  table.querySelectorAll('tbody tr').forEach(tr => {
    const cols = Array.from(tr.querySelectorAll('td'))
      .map(td => td.textContent.replace(/,/g, '.'));
    csv += cols.join(',') + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'relatorios_viagens.csv';
  a.click();
  URL.revokeObjectURL(url);
});

// Exporta PDF em orientação horizontal (paisagem)
document.getElementById('exportPdf').addEventListener('click', () => {
    const element = document.getElementById('tabelaRelatorios');
    if (!element) return;
  
    const opt = {
      margin:       10,
      filename:     'relatorios_viagens.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'pt', format: 'a4', orientation: 'landscape' }
    };
  
    // Inicia a geração do PDF com as opções acima
    html2pdf().set(opt).from(element).save();
  });