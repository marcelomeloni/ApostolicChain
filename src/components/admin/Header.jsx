import { Bell, Search } from 'lucide-react';

function Header({ title }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-sm px-6">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      </div>

    
    </header>
  );
}

export default Header;