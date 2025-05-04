// js/app.js
import './db.js';
import './veiculo.js';
import './viagem.js';
import './abastecimento.js';
import './custo.js';
import './relatorio.js';

document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('nav.tabs button');
  const sections = document.querySelectorAll('main section.tab-content');

  function showTab(id) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === id));
    sections.forEach(s => s.classList.toggle('active', s.id === id));
    const fn = window['load' + id.charAt(0).toUpperCase() + id.slice(1).replace(/-([a-z])/g,(m,c)=>c.toUpperCase())];
    if (typeof fn === 'function') fn();
  }

  tabs.forEach(tab => tab.addEventListener('click', () => showTab(tab.dataset.tab)));
  showTab(document.querySelector('nav.tabs button.active').dataset.tab);
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('Service Worker registrado em:', reg.scope))
      .catch(err => console.error('Erro SW:', err));
  });
}
