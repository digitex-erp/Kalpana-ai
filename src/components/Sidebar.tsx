// src/components/Sidebar.tsx
import React from 'react';

type Page = 'dashboard' | 'newProjectFlow' | 'library' | 'settings' | 'about' | 'editProject' | 'templates';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const NavItem: React.FC<{
  pageName: Page;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  icon: React.ReactNode;
  label: string;
  isCreationFlow?: boolean;
}> = ({ pageName, currentPage, onNavigate, icon, label, isCreationFlow = false }) => {
  const isActive = isCreationFlow ? (currentPage === 'newProjectFlow' || currentPage === 'editProject') : currentPage === pageName;
  
  return (
    <button
      onClick={() => onNavigate(isCreationFlow ? 'dashboard' : pageName)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
        isActive
          ? 'bg-cyan-500/20 text-cyan-300'
          : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
      }`}
    >
      <span className="w-6 h-6">{icon}</span>
      <span className="font-semibold">{label}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  return (
    <aside className="w-64 bg-gray-800/50 border-r border-gray-700 p-4 flex flex-col flex-shrink-0">
      <div onClick={() => onNavigate('dashboard')} className="flex items-center gap-3 px-2 mb-8 cursor-pointer group">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300 transition-colors">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5v-5.714c0-.597-.237-1.17-.659-1.591L14.25 3.104 9.75 3.104 5 7.104 9.75 11.104 14.25 7.104 19 11.104M19 14.5v6.375c0 .621-.504 1.125-1.125 1.125H6.125A1.125 1.125 0 015 20.875v-6.375m14 0-4.25 4.25-4.25-4.25m0 0-4.25 4.25" />
        </svg>
        <h1 className="text-xl font-bold text-gray-200 group-hover:text-white transition-colors">
            Kalpana <span className="text-cyan-400 group-hover:text-cyan-300 transition-colors">AI</span>
        </h1>
      </div>

      <nav className="flex-grow space-y-2">
        <NavItem pageName="dashboard" currentPage={currentPage} onNavigate={onNavigate} label="Dashboard" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>} />
        <button onClick={() => onNavigate('newProjectFlow')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${ currentPage === 'newProjectFlow' || currentPage === 'editProject' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'}`}>
             <span className="w-6 h-6"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>
             <span className="font-semibold">New Video</span>
        </button>
        <NavItem pageName="library" currentPage={currentPage} onNavigate={onNavigate} label="Video Library" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-8.625 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125h1.5m12.75 1.5v-12.75m0 12.75h-1.5c-.621 0-1.125-.504-1.125-1.125v-1.5m0 0V5.625m0 0a1.125 1.125 0 011.125-1.125h1.5m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 5.625c0-.621.504-1.125 1.125-1.125h1.5" /></svg>} />
        <NavItem pageName="templates" currentPage={currentPage} onNavigate={onNavigate} label="Templates" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>} />
      </nav>

      <div className="mt-auto space-y-2">
         <NavItem pageName="settings" currentPage={currentPage} onNavigate={onNavigate} label="Settings" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995s.145.755.438.995l1.003.827c.48.398.668 1.03.26 1.431l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.075.124a6.57 6.57 0 01-.22.127c-.332.183-.582.495-.645.87l-.213 1.281c-.09.542-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.003-.827c.293-.24.438.613.438-.995s-.145-.755-.438-.995l-1.003-.827a1.125 1.125 0 01-.26-1.431l1.296-2.247a1.125 1.125 0 011.37-.49l1.217.456c.355.133.75.072 1.075-.124.073-.044.146-.087.22-.127.332-.183.582-.495.645-.87l.213-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
         <NavItem pageName="about" currentPage={currentPage} onNavigate={onNavigate} label="About" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>} />
      </div>
    </aside>
  );
};

export default Sidebar;