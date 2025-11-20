import React from 'react';

interface HeaderProps {
    onAboutClick: () => void;
    // Fix: Add onHomeClick to props to allow clicking logo to go home.
    onHomeClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAboutClick, onHomeClick }) => {
  return (
    <header className="py-4 px-8 w-full">
      <div className="flex justify-between items-center">
        {/* Fix: Wrap logo and title in a clickable element to handle onHomeClick. */}
        <div onClick={onHomeClick} className="flex items-center gap-3 cursor-pointer group">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300 transition-colors">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5v-5.714c0-.597-.237-1.17-.659-1.591L14.25 3.104 9.75 3.104 5 7.104 9.75 11.104 14.25 7.104 19 11.104M19 14.5v6.375c0 .621-.504 1.125-1.125 1.125H6.125A1.125 1.125 0 015 20.875v-6.375m14 0-4.25 4.25-4.25-4.25m0 0-4.25 4.25" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-200 group-hover:text-white transition-colors">
                Kalpana <span className="text-cyan-400 group-hover:text-cyan-300 transition-colors">AI</span> Video Studio
            </h1>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={onAboutClick} className="text-gray-400 hover:text-cyan-400 transition-colors">
                About
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;