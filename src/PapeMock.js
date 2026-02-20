// src/PapeMock.js
//
// parent_hash = quem consagrou esse papa (cadeia apostólica episcopal)
// last_hash   = quem foi o papa anterior na sucessão (cadeia de ofício)
//
// "00X00X00" = hash especial: registro de consagração não encontrado na cadeia.
//              O trace mostrará um nó de "Dados Perdidos" com link direto para Jesus.

export const popes = [
  // --- Século I ---
  // Jesus é a raiz — não tem consagrador
  { id: 1,  name: "Jesus Cristo",  hash: "jesus",      last_hash: null,         parent_hash: null,         start_date: "0" , imgUrl: "https://static.nationalgeographicbrasil.com/files/styles/image_3200/public/jesus-christ-pantokrator-2157_1.jpg" },

  // Pedro foi consagrado diretamente por Jesus
  { id: 2,  name: "São Pedro",     hash: "pedro",      last_hash: "jesus",      parent_hash: "jesus",      start_date: "33"  },

  // Lino foi consagrado por Pedro
  { id: 3,  name: "Lino",          hash: "lino",       last_hash: "pedro",      parent_hash: "pedro",      start_date: "67"  },

  // Anacleto foi consagrado por Lino
  { id: 4,  name: "Anacleto",      hash: "anacleto",   last_hash: "lino",       parent_hash: "lino",       start_date: "79"  },

  // Clemente I — consagrado por Pedro (tradição patrística, não por Anacleto)
  { id: 5,  name: "Clemente I",    hash: "clemente",   last_hash: "anacleto",   parent_hash: "pedro",      start_date: "92"  },

  // Evaristo — consagrado por Clemente
  { id: 6,  name: "Evaristo",      hash: "evaristo",   last_hash: "clemente",   parent_hash: "clemente",   start_date: "97"  },

  // --- Século II ---
  // Alexandre I — consagrado por Evaristo
  { id: 7,  name: "Alexandre I",   hash: "alexandre1", last_hash: "evaristo",   parent_hash: "evaristo",   start_date: "105" },

  // Sisto I — consagrado por bispo não documentado (registro perdido)
  { id: 8,  name: "Sisto I",       hash: "sisto1",     last_hash: "alexandre1", parent_hash: "00X00X00",   start_date: "115" },

  // Telésforo — consagrado por Sisto I
  { id: 9,  name: "Telésforo",     hash: "telesforo",  last_hash: "sisto1",     parent_hash: "sisto1",     start_date: "125" },

  // Higino — consagrado por Telésforo
  { id: 10, name: "Higino",        hash: "higino",     last_hash: "telesforo",  parent_hash: "telesforo",  start_date: "136" },

  // Pio I — consagrado por Higino
  { id: 11, name: "Pio I",         hash: "pio1",       last_hash: "higino",     parent_hash: "higino",     start_date: "140" },

  // Aniceto — consagrado por bispo sírio desconhecido (registro perdido)
  { id: 12, name: "Aniceto",       hash: "aniceto",    last_hash: "pio1",       parent_hash: "00X00X00",   start_date: "155" },

  // Sotero — consagrado por Aniceto
  { id: 13, name: "Sotero",        hash: "sotero",     last_hash: "aniceto",    parent_hash: "aniceto",    start_date: "166" },

  // Eleutério — consagrado por Sotero
  { id: 14, name: "Eleutério",     hash: "eleuterio",  last_hash: "sotero",     parent_hash: "sotero",     start_date: "174" },

  // Vítor I — consagrado por Eleutério
  { id: 15, name: "Vítor I",       hash: "vitor1",     last_hash: "eleuterio",  parent_hash: "eleuterio",  start_date: "189" },

  // Zeferino — consagrado por bispo africano não identificado (registro perdido)
  { id: 16, name: "Zeferino",      hash: "zeferino",   last_hash: "vitor1",     parent_hash: "00X00X00",   start_date: "199" },

  // --- Século III ---
  // Calisto I — consagrado por Zeferino
  { id: 17, name: "Calisto I",     hash: "calisto1",   last_hash: "zeferino",   parent_hash: "zeferino",   start_date: "217" },

  // Urbano I — consagrado por Calisto I
  { id: 18, name: "Urbano I",      hash: "urbano1",    last_hash: "calisto1",   parent_hash: "calisto1",   start_date: "222" },

  // Ponciano — consagrado por Urbano I
  { id: 19, name: "Ponciano",      hash: "ponciano",   last_hash: "urbano1",    parent_hash: "urbano1",    start_date: "230" },

  // Antero — consagrado por bispo não documentado (registro perdido)
  { id: 20, name: "Antero",        hash: "antero",     last_hash: "ponciano",   parent_hash: "00X00X00",   start_date: "235" },

  // Fabiano — consagrado por Antero
  { id: 21, name: "Fabiano",       hash: "fabiano",    last_hash: "antero",     parent_hash: "antero",     start_date: "236" },
];