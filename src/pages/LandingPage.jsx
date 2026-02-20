import { useState, useEffect, useRef } from 'react';
import { HomeService } from '../services/HomeService';
// ── Ícones Premium (SVG) ───────────────────────────────────────────────────────
const Icons = {
  Church: (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 22V10l-6-6-6 6v12"/>
      <path d="M12 22v-6"/>
      <path d="M9 22h6"/>
      <path d="M12 2v4"/>
      <path d="M10 4h4"/>
    </svg>
  ),
  Cross: (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20"/>
      <path d="M8 8h8"/>
    </svg>
  ),
  Users: (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  Activity: (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  ),
  Infinity: (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z"/>
    </svg>
  )
};
// ── Animated counter hook ─────────────────────────────────────────────────────
function useCountUp(target, duration = 2200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Se o target for 0 ou indefinido, não faz nada
    if (!target) return;

    let start = 0;
    const step = target / (duration / 16);
    
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { 
        setCount(target); 
        clearInterval(timer); 
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    // Limpeza perfeita para o React Strict Mode não travar o contador
    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, delay }) {
  const count = useCountUp(value);
  return (
    <div
      className="relative flex flex-col items-center justify-center p-10 border border-amber-900/20 bg-stone-950/60 group hover:border-amber-700/40 transition-all duration-500 overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900/0 to-amber-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* 👇 Trocamos o emoji por esta tag que estiliza o SVG */}
      <div className="mb-5 text-amber-700/50 group-hover:text-amber-500 transition-colors duration-500 drop-shadow-md">
        {icon}
      </div>
      
      <span className="font-display text-5xl font-black text-amber-500 leading-none mb-3 tabular-nums">
        {count.toLocaleString('pt-BR')}
      </span>
      <span className="font-mono text-[10px] tracking-[4px] uppercase text-stone-500">{label}</span>
    </div>
  );
}

// ── Pope Card ─────────────────────────────────────────────────────────────────
function PopeCard({ pope, index }) {
  const date = pope.papacyStartDate ?? pope.papacy_start_date;
  const year = date ? new Date(date).getFullYear() : null;

  return (
    <a
      href={`/explore?hash=${pope.hash}`}
      className="group relative flex flex-col justify-between p-8 bg-stone-950 border border-stone-800 hover:border-amber-800/60 transition-all duration-400 overflow-hidden cursor-pointer no-underline"
    >
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-600 to-amber-900 scale-y-0 group-hover:scale-y-100 transition-transform duration-400 origin-bottom" />
      <div className="absolute top-4 right-6 font-display text-6xl font-black text-stone-800/40 leading-none select-none group-hover:text-amber-900/30 transition-colors duration-400">
        {String(index + 1).padStart(2, '0')}
      </div>
      <div>
        <div className="font-mono text-[9px] tracking-[4px] uppercase text-amber-700/60 mb-3">Papa</div>
        <h3 className="font-display text-xl font-bold italic text-stone-100 leading-snug mb-3 group-hover:text-amber-100 transition-colors duration-300">
          {pope.name}
        </h3>
        {year && (
          <div className="font-mono text-[10px] tracking-[3px] text-stone-500">
            Desde {year} d.C.
          </div>
        )}
      </div>
      <div className="mt-6 pt-5 border-t border-stone-800/80">
        <div className="font-mono text-[9px] text-stone-700 truncate">
          {pope.hash?.slice(0, 16)}...{pope.hash?.slice(-8)}
        </div>
      </div>
    </a>
  );
}

// ── Main Landing Page ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const [stats, setStats]             = useState(null);
  const [recentPopes, setRecentPopes] = useState([]);
  const [searchTerm, setSearchTerm]   = useState('');
  const [results, setResults]         = useState([]);
  const [searching, setSearching]     = useState(false);
  const [visible, setVisible]         = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // Chamada única: Busca estatísticas e a lista de papas otimizada
        const statsData = await HomeService.getPublicStats();
        
        console.log("🔥 DADOS RECEBIDOS DO JAVA:", statsData);

        if (statsData) {
          // 1. Atualiza os contadores (Bispos, Papas, Clérigos, Views)
          setStats(statsData);

          // 2. Atualiza os cards com a lista que o Java já filtrou (os 6 recentes)
          // Não precisa mais de .slice() ou .reverse() aqui
          setRecentPopes(statsData.recentPopes || []);
        }
      } catch (error) {
        console.error("❌ Erro ao carregar dados da Landing Page:", error);
      } finally {
        // Pequeno delay para garantir que a animação de entrada (fade-up) funcione
        setTimeout(() => setVisible(true), 80);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try { setResults(await HomeService.search(searchTerm) || []); }
      catch { setResults([]); }
      finally { setSearching(false); }
    }, 320);
    return () => clearTimeout(t);
  }, [searchTerm]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&family=Cinzel:wght@400;600;700&family=IBM+Plex+Mono:wght@300;400&display=swap');

        .font-display { font-family: 'Playfair Display', serif; }
        .font-mono    { font-family: 'IBM Plex Mono', monospace; }
        .font-title   { font-family: 'Cinzel', serif; }

        html { scroll-behavior: smooth; }

        body {
          background: #080603;
          color: #e8dfc8;
        }

        /* Grain overlay */
        body::after {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9999;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes crossFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-18px) rotate(4deg); }
          66%       { transform: translateY(-8px) rotate(-3deg); }
        }

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .animate-fade-up { animation: fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) forwards; opacity: 0; }
        .animate-fade-in { animation: fadeIn 1.2s ease forwards; opacity: 0; }

        .cross-float { animation: crossFloat ease-in-out infinite; }

        .shimmer-text {
          background: linear-gradient(90deg, #c9a84c 0%, #f0d080 40%, #c9a84c 60%, #8a6d2f 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s linear infinite;
        }

        .hero-glow {
          background:
            radial-gradient(ellipse 70% 50% at 50% 0%, rgba(201,168,76,0.10) 0%, transparent 65%),
            radial-gradient(ellipse 40% 30% at 80% 80%, rgba(139,26,26,0.06) 0%, transparent 60%);
        }

        .line-gold {
          background: linear-gradient(90deg, transparent 0%, #c9a84c 50%, transparent 100%);
        }

        .search-glow:focus-within {
          box-shadow: 0 0 0 1px rgba(201,168,76,0.4), 0 8px 40px rgba(201,168,76,0.12);
        }

        .btn-gold {
          background: linear-gradient(135deg, #c9a84c 0%, #8a6d2f 100%);
          clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          transition: all 0.3s ease;
        }

        .btn-gold:hover {
          background: linear-gradient(135deg, #e8c97a 0%, #c9a84c 100%);
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(201,168,76,0.25);
        }

        .btn-outline {
          clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          transition: all 0.3s ease;
        }

        .btn-outline:hover {
          background: rgba(201,168,76,0.08);
          transform: translateY(-2px);
        }

        .grid-lines {
          background-image:
            linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px);
          background-size: 80px 80px;
        }
      `}</style>

      {/* ── NAV ─────────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
           style={{ background: 'linear-gradient(180deg, rgba(8,6,3,0.95) 0%, transparent 100%)', backdropFilter: 'blur(12px)' }}>
        <span className="font-title text-amber-500 text-sm tracking-[4px]">✝ APOSTOLIC CHAIN</span>
        <div className="hidden md:flex items-center gap-8">
          {['Sobre', 'Dados',  'Papas'].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`}
               className="font-mono text-[10px] tracking-[3px] uppercase text-stone-500 hover:text-amber-500 transition-colors duration-200 no-underline">
              {item}
            </a>
          ))}
        </div>
        <a href="/"
           className="btn-gold font-title text-[10px] tracking-[3px] uppercase px-6 py-3 text-stone-950 font-semibold no-underline">
          Explorar
        </a>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="hero-glow grid-lines relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden"
               id="sobre">

        {/* Floating crosses background */}
        {[
          { top: '12%', left: '8%',  size: 14, opacity: 0.04, dur: '9s',  delay: '0s' },
          { top: '70%', left: '5%',  size: 10, opacity: 0.03, dur: '12s', delay: '1s' },
          { top: '25%', right: '7%', size: 18, opacity: 0.05, dur: '11s', delay: '2s' },
          { top: '65%', right: '9%', size: 12, opacity: 0.03, dur: '8s',  delay: '0.5s' },
          { top: '45%', left: '3%',  size: 8,  opacity: 0.03, dur: '14s', delay: '3s' },
          { top: '80%', right: '4%', size: 9,  opacity: 0.03, dur: '10s', delay: '1.5s' },
        ].map((p, i) => (
          <span key={i} className="cross-float absolute font-title text-amber-500 pointer-events-none select-none"
                style={{ ...p, fontSize: p.size, animationDuration: p.dur, animationDelay: p.delay }}>✝</span>
        ))}

        {/* Eyebrow */}
        <p className="animate-fade-up font-mono text-[10px] tracking-[6px] uppercase text-amber-600/70 mb-8"
           style={{ animationDelay: '0.1s' }}>
          Sucessão Apostolica · Desde 33 d.C. · Blockchain Solana
        </p>

        {/* Title */}
        <div className="animate-fade-up mb-2" style={{ animationDelay: '0.25s' }}>
          <h1 className="font-display font-black leading-[0.88] tracking-tight"
              style={{ fontSize: 'clamp(64px, 13vw, 148px)' }}>
            <span className="text-stone-100 block">Apostolic</span>
            <span className="shimmer-text block italic">Chain</span>
          </h1>
        </div>

        {/* Divider */}
        <div className="animate-fade-up flex items-center gap-4 my-10 w-72" style={{ animationDelay: '0.4s' }}>
          <div className="flex-1 h-px line-gold opacity-40" />
          <span className="font-title text-amber-600 text-lg">✝</span>
          <div className="flex-1 h-px line-gold opacity-40" />
        </div>

        {/* Subtitle */}
        <p className="animate-fade-up font-display text-xl italic font-light text-stone-400 max-w-xl leading-relaxed mb-12"
           style={{ animationDelay: '0.55s' }}>
          A cadeia ininterrupta de consagrações desde Cristo — registrada,
          verificada e imutável na blockchain.
        </p>

        {/* CTAs */}
        <div className="animate-fade-up flex flex-wrap gap-4 justify-center" style={{ animationDelay: '0.7s' }}>
          <a href="/"
             className="btn-gold font-title text-[11px] tracking-[4px] uppercase px-10 py-5 text-stone-950 font-semibold no-underline">
            Explorar o Grafo
          </a>
        
        </div>

      
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────────── */}
      <section className="relative py-28 px-6" id="dados"
               style={{ background: 'linear-gradient(180deg, #080603 0%, #0d0a06 100%)' }}>
        <div className="absolute top-0 left-0 right-0 h-px line-gold opacity-20" />

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-mono text-[9px] tracking-[5px] uppercase text-amber-700 block mb-4">
              Dados em Tempo Real
            </span>
            <h2 className="font-display font-bold text-stone-100" style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}>
              A Cadeia em <em className="text-amber-500">Números</em>
            </h2>
          </div>

         {stats ? (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-px bg-amber-900/10">
              <StatCard label="Bispos"         value={stats.totalBishops} icon={Icons.Church}   delay={0}   />
              <StatCard label="Papas"          value={stats.totalPopes}   icon={Icons.Cross}    delay={120} />
              <StatCard label="Total Clérigos" value={stats.totalClergy}  icon={Icons.Users}    delay={240} />
              <StatCard label="Acessos Hoje"   value={stats.todayViews}   icon={Icons.Activity} delay={360} />
              <StatCard label="Total Acessos"  value={stats.totalViews}   icon={Icons.Infinity} delay={480} />
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="font-mono text-[10px] tracking-[4px] uppercase text-stone-600 animate-pulse">
                Carregando dados...
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px line-gold opacity-20" />
      </section>

   

      {/* ── RECENT POPES ──────────────────────────────────────────────────────── */}
      {recentPopes.length > 0 && (
        <section className="relative py-28 px-6" id="papas"
                 style={{ background: 'linear-gradient(180deg, #0d0a06 0%, #080603 100%)' }}>
          <div className="absolute top-0 left-0 right-0 h-px line-gold opacity-20" />

          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="font-mono text-[9px] tracking-[5px] uppercase text-amber-700 block mb-4">
                Cadeia Principal
              </span>
              <h2 className="font-display font-bold text-stone-100" style={{ fontSize: 'clamp(32px, 5vw, 52px)' }}>
                Papas <em className="text-amber-500">Recentes</em>
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-stone-800/20">
              {recentPopes.map((pope, i) => (
                <PopeCard key={pope.hash} pope={pope} index={i} />
              ))}
            </div>

         
          </div>
        </section>
      )}

      {/* ── ABOUT / MANIFESTO ────────────────────────────────────────────────── */}
      <section className="relative py-28 px-6 overflow-hidden"
               style={{ background: 'radial-gradient(ellipse 60% 40% at 80% 50%, rgba(139,26,26,0.05) 0%, #080603 55%)' }}>
        <div className="absolute top-0 left-0 right-0 h-px line-gold opacity-20" />

        <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-16 items-start">

          {/* Left column */}
          <div className="md:col-span-2">
            <div className="font-title text-[100px] leading-none text-amber-500/10 mb-6 select-none">✝</div>
            <span className="font-mono text-[9px] tracking-[5px] uppercase text-amber-700 block mb-4">
              Sobre o Projeto
            </span>
            <h2 className="font-display font-bold italic text-stone-100 leading-tight mb-8"
                style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>
              O que é a<br />Apostolic Chain?
            </h2>
            <a href="/"
               className="btn-gold font-title text-[10px] tracking-[4px] uppercase px-8 py-4 text-stone-950 font-semibold no-underline inline-block">
              Explorar Agora
            </a>
          </div>

          {/* Right column */}
          <div className="md:col-span-3 space-y-7">
            {[
              {
                title: 'Sucessão Apostólica',
                text: 'A Apostolic Chain é um registro público e imutável da sucessão apostólica — a cadeia ininterrupta de consagrações episcopais que liga cada bispo e papa de hoje diretamente a São Pedro e, por extensão, a Jesus Cristo.',
              },
              {
                title: 'Verificação Criptográfica',
                text: 'Cada entrada é identificada por um hash criptográfico único, derivado deterministicamente do nome, data e consagrador do clérigo. Impossível falsificar, impossível apagar.',
              },
              {
                title: 'Ancorado na Blockchain',
                text: 'Os registros são ancorados na blockchain Solana, garantindo permanência e verificabilidade independente — qualquer pessoa pode auditar a cadeia sem depender de autoridade central.',
              },
            ].map(({ title, text }) => (
              <div key={title} className="flex gap-6">
                <div className="flex-shrink-0 w-px bg-gradient-to-b from-amber-600 to-amber-900/30 mt-1" />
                <div>
                  <h4 className="font-title text-amber-500 text-xs tracking-[3px] uppercase mb-3">{title}</h4>
                  <p className="font-display text-lg font-light text-stone-400 leading-relaxed italic">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="relative py-12 px-6 text-center"
              style={{ borderTop: '1px solid rgba(201,168,76,0.12)', background: '#080603' }}>
        <div className="font-title text-amber-700/60 text-sm tracking-[5px] mb-3">✝ APOSTOLIC CHAIN</div>
        <p className="font-mono text-[9px] tracking-[3px] uppercase text-stone-700">
          Sucessão Apostolica · Solana Devnet · {new Date().getFullYear()}
        </p>
      </footer>
    </>
  );
}