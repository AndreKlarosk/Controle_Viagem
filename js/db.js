// js/db.js
// Módulo de acesso ao IndexedDB para o app Controle de Viagens

const DB_NAME = 'controle-viagem-db';
const DB_VERSION = 1;
let db;

// Abre conexão com o banco e cria stores se necessário
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = event => {
      db = event.target.result;
      if (!db.objectStoreNames.contains('veiculos')) {
        db.createObjectStore('veiculos', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('viagens')) {
        const store = db.createObjectStore('viagens', { keyPath: 'id', autoIncrement: true });
        store.createIndex('veiculoId', 'veiculoId', { unique: false });
      }
      if (!db.objectStoreNames.contains('abastecimentos')) {
        const store = db.createObjectStore('abastecimentos', { keyPath: 'id', autoIncrement: true });
        store.createIndex('viagemId', 'viagemId', { unique: false });
      }
      if (!db.objectStoreNames.contains('gastosExtras')) {
        const store = db.createObjectStore('gastosExtras', { keyPath: 'id', autoIncrement: true });
        store.createIndex('viagemId', 'viagemId', { unique: false });
      }
    };
    request.onsuccess = event => {
      db = event.target.result;
      resolve(db);
    };
    request.onerror = event => reject(event.target.error);
  });
}

// Retorna objectStore para transações
function getStore(storeName, mode = 'readonly') {
  return db.transaction(storeName, mode).objectStore(storeName);
}

// Funções CRUD genéricas
async function add(storeName, data) {
  await openDB();
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite');
    const req = store.add(data);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getAll(storeName) {
  await openDB();
  return new Promise((resolve, reject) => {
    const store = getStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getById(storeName, id) {
  await openDB();
  return new Promise((resolve, reject) => {
    const store = getStore(storeName);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function updateItem(storeName, data) {
  await openDB();
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite');
    const req = store.put(data);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function deleteItem(storeName, id) {
  await openDB();
  return new Promise((resolve, reject) => {
    const store = getStore(storeName, 'readwrite');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export { openDB, add, getAll, getById, updateItem, deleteItem };
