# ✝️ Apostolic Chain

> A ponte entre dois milênios: História, Fé e Criptografia.

A Apostolic Chain não é apenas um banco de dados de clérigos; é um esforço técnico para mapear a sucessão apostólica — a linhagem ininterrupta de consagrações que remonta a Jesus Cristo — e imortalizá-la na blockchain.

Este projeto nasceu da necessidade de transformar registros históricos muitas vezes fragmentados em um **Grafo de Conhecimento imutável, auditável e visualmente imersivo**.

---

## 🏛️ O Conceito: “Catedral Digital”

A identidade visual foi projetada para evocar a solenidade de uma catedral.

Utilizamos uma paleta inspirada em:

- Pedra (`stone-950`)
- Ouro (`amber-500`)
- Tons de pergaminho antigo

O objetivo é simples:

> **A tecnologia desaparece. A história assume o palco principal.**

---

## 🌳 O Grafo Vertical (A Jóia do Projeto)

Diferente de visualizações circulares confusas, a Apostolic Chain implementa uma **Árvore de Sucessão Vertical**.

### ✝️ Jesus & Pedro como Raízes

A linhagem começa no topo e desce cronologicamente ao longo de dois mil anos de história.

### 🩸 Trace Path (Rastro de Sangue)

Ao clicar em qualquer bispo, o sistema executa um **backtrace em tempo real até Jesus Cristo**, iluminando o caminho exato da sucessão apostólica.

### 📜 Nós de Dados Perdidos

Reconhecemos as lacunas da história.  
Quando uma linhagem é interrompida por ausência de registros documentais, o grafo gera automaticamente um **nó de “Dados Perdidos”**, preservando a integridade visual enquanto sinaliza a falha histórica.

### 🕰 Efeito Século

O grafo é ancorado por séculos, permitindo que o usuário navegue por **2.000 anos de história** com fluidez através de uma timeline dedicada.

---

## 🛠️ O Motor sob o Capô

O projeto é dividido em dois pilares que se comunicam através de uma API REST robusta:

---

### ⚙️ Backend (Coração de Dados)

- **Java & Spring Boot**  
  Arquitetura sólida para lidar com relacionamentos complexos de parentesco episcopal.

- **PostgreSQL (Supabase)**  
  Armazenamento de milhares de registros com integridade referencial.

- **Solana Devnet**  
  Registro de hashes para garantir que os dados não possam ser alterados retroativamente.

- **Criptografia Determinística**  
  Cada clérigo possui um hash derivado de sua consagração episcopal.

---

### 🌍 Frontend (A Experiência)

- **React & Tailwind**  
  Interface moderna com estética clássica.

- **React Force Graph**  
  Motor de renderização customizado para visualização vertical com zoom, fly-to e interações dinâmicas.

- **Admin Dashboard**  
  Área restrita para gestão de dados, onde bispos e papas podem ser catalogados e vinculados aos seus consagradores.

---

## 📂 Estrutura do Ecossistema

```plaintext
├── 🌍 Frontend (React)
│   ├── src/pages/ApostolicTree.jsx   # Lógica principal do Grafo Vertical
│   ├── src/services/HomeService.js   # Integração com o Backend
│   └── src/components/GraphCanvas    # Onde a mágica visual acontece
│
├── ⚙️ Backend (Spring Boot)
│   ├── controller/PublicStats        # Números da rede em tempo real
│   ├── repository/ClergyRepository   # Queries complexas de linhagem
│   └── service/SolanaConfig          # Ancoragem em blockchain
```

---

## 🚀 Como rodar o ecossistema

### 🔹 Backend

1. Configure seu banco de dados no `application.properties`
2. Execute:

```bash
./mvnw spring-boot:run
```

---

### 🔹 Frontend

1. Instale as dependências:

```bash
npm install
```

2. Configure a URL da sua API no `ApiService.js`

3. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

---

## 🛡️ Notas de Desenvolvimento

Este projeto lida com dados que têm séculos de idade.

Durante o desenvolvimento do grafo, enfrentamos o desafio de renderizar milhares de nós sem comprometer a performance. A solução incluiu:

- Uso intensivo de `useMemo` e `useCallback`
- Otimização da física do grafo
- Lógica de **limpeza de nós transientes**, removendo elementos de busca quando não são mais necessários
- Estratégias para evitar re-renderizações desnecessárias

O resultado é uma experiência fluida, mesmo com milhares de conexões históricas.

---

## ✝️ Visão

A Apostolic Chain é mais do que software.

É a tentativa de preservar, estruturar e proteger digitalmente uma das tradições históricas mais antigas do mundo — utilizando as ferramentas mais modernas da humanidade.

**Fé encontra código. História encontra blockchain.**
