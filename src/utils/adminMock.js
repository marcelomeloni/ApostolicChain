export const stats = {
  isInitialized: false, // <--- CONTROLE DE ESTADO AQUI
  accesses: 15420,
  activeUsers: 34,
  totalBishops: 5400,
  lastUpdate: '18/02/2026'
};

export const mockBishops = [
  { id: 1, name: 'Dom Pedro Casaldáliga', consecratedBy: '0x123...abc', date: '1971-10-23' },
  { id: 2, name: 'Dom Helder Câmara', consecratedBy: '0x456...def', date: '1952-04-20' },
  { id: 3, name: 'Dom Paulo Evaristo', consecratedBy: '0x789...ghi', date: '1961-05-12' },
];

export const mockPopes = [
  { id: 1, name: 'Papa Francisco', period: '2013 - Presente' },
  { id: 2, name: 'Bento XVI', period: '2005 - 2013' },
  { id: 3, name: 'João Paulo II', period: '1978 - 2005' },
];