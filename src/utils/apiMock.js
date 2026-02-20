import { popes } from '../PapeMock';

// A Corrente Principal (Apenas a linha dos Papas)
export const fetchMainChain = async () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(popes), 300);
  });
};

// Simulando o Banco de Dados Completo da Igreja com ramificações profundas
const allBishopsDatabase = [
  // --- A LINHAGEM DE ALEXANDRIA (Uma sidechain profunda) ---
  // Papa Ponciano ordena o Bispo Heráclio
  {
    id: `bishop-heraclio`,
    name: "Bispo Heráclio de Alexandria",
    ordination_date: "231-01-10",
    papacy_id: "ponciano", 
    parent_hash: "ponciano", // Consagrante: Papa Ponciano
    hash: `hash-heraclio`
  },
  // Heráclio ordena Dionísio (Bispo -> Bispo)
  {
    id: `bishop-dionisio`,
    name: "Bispo Dionísio, o Grande",
    ordination_date: "248-05-20",
    papacy_id: "fabiano", // Já estamos no papado de Fabiano, mas a linha vem de Ponciano
    parent_hash: "hash-heraclio", // Consagrante: Bispo Heráclio
    hash: `hash-dionisio`
  },
  // Dionísio ordena Máximo (Bispo -> Bispo -> Bispo)
  {
    id: `bishop-maximo`,
    name: "Bispo Máximo de Alexandria",
    ordination_date: "265-11-12",
    papacy_id: "fabiano", 
    parent_hash: "hash-dionisio", // Consagrante: Bispo Dionísio
    hash: `hash-maximo`
  },
  // Máximo ordena um Padre local
  {
    id: `priest-teonas`,
    name: "Padre Teonas",
    ordination_date: "280-02-25",
    papacy_id: "fabiano", 
    parent_hash: "hash-maximo", // Consagrante: Bispo Máximo
    hash: `hash-teonas`
  },

  // --- O LEQUE DE ORDENAÇÕES (Um bispo ordenando vários de uma vez) ---
  // Papa Calisto I ordena um Bispo Missionário
  {
    id: `bishop-missionario`,
    name: "Bispo Missionário da Gália",
    ordination_date: "220-08-15",
    papacy_id: "calisto1", 
    parent_hash: "calisto1", // Consagrante: Papa Calisto I
    hash: `hash-miss-galia`
  },
  // O Bispo Missionário ordena três padres de uma vez para sua diocese
  {
    id: `priest-gaul-1`,
    name: "Padre Martinho",
    ordination_date: "225-04-01",
    papacy_id: "urbano1", 
    parent_hash: "hash-miss-galia", 
    hash: `hash-martinho`
  },
  {
    id: `priest-gaul-2`,
    name: "Padre Remígio",
    ordination_date: "225-04-01",
    papacy_id: "urbano1", 
    parent_hash: "hash-miss-galia", 
    hash: `hash-remigio`
  },
  {
    id: `priest-gaul-3`,
    name: "Padre Clóvis",
    ordination_date: "225-04-01",
    papacy_id: "urbano1", 
    parent_hash: "hash-miss-galia", 
    hash: `hash-clovis`
  },

  // --- O NÓ FANTASMA (Quebra de dados na blockchain) ---
  // Um Bispo no papado de Antero, ordenado por alguém cujo bloco ainda não baixamos
  {
    id: `bishop-deserto`,
    name: "Bispo Antão do Deserto",
    ordination_date: "235-12-01",
    papacy_id: "antero", 
    parent_hash: "hash-cardeal-perdido-99", // ESSE HASH NÃO ESTÁ NO MOCK INICIAL!
    hash: `hash-antao-deserto`
  }
];

// Retorna os bispos filtrados pela Era (Papado)
export const fetchBishopsByEra = async (papacyHash) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const eraBishops = allBishopsDatabase.filter(b => b.papacy_id === papacyHash);
      resolve(eraBishops); 
    }, 500);
  });
};

// Busca específica para resolver Nós Fantasmas
export const fetchNodeByHash = async (hash) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let node = allBishopsDatabase.find(b => b.hash === hash);
      
      if (!node) {
        node = popes.find(p => p.hash === hash);
      }
      
      // Se a API for consultada sobre aquele hash fantasma, ela "encontra" o bloco perdido
      if (!node && hash === "hash-cardeal-perdido-99") {
          resolve([{
              id: "hash-cardeal-perdido-99",
              name: "Cardeal Perdido de Roma",
              type: "bishop",
              parent_hash: "zeferino", // E prova que ele foi ordenado pelo Papa Zeferino!
              hash: "hash-cardeal-perdido-99"
          }]);
          return;
      }
      
      resolve(node ? [node] : []); 
    }, 500);
  });
};