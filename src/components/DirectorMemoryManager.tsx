import React, { useState, useEffect } from 'react';
import { MemoryEntry } from '../types';
import { loadMemory, clearMemory } from '../services/directorMemoryService';

const DirectorMemoryManager: React.FC = () => {
    const [logs, setLogs] = useState<MemoryEntry[]>([]);

    useEffect(() => {
        setLogs(loadMemory());
    }, []);

    const handleClear = () => {
        if (window.confirm("Are you sure you want to clear the AI's daily memory log? This cannot be undone.")) {
            clearMemory();
            setLogs([]);
        }
    };
    
    return (
        <div>
            <h3 className="text-xl font-semibold text-cyan-400">AI Director Memory</h3>
            <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-600 space-y-4">
                <div className="flex items-start gap-3">
                    <div className="text-cyan-400 mt-1">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-300">Continuity Log</h4>
                        <p className="text-sm text-gray-400">A log of your feedback from recent sessions that the AI reviews before each task to improve over time.</p>
                    </div>
                </div>

                {logs.length > 0 ? (
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                        {logs.map((log) => (
                            <div key={log.timestamp} className="text-xs border-t border-gray-700/50 pt-2">
                                <p className="font-bold text-gray-400">{log.date}</p>
                                {log.feedback.length > 0 && <p className="text-gray-500">Feedback: <span className="text-gray-300 line-clamp-2">{log.feedback.join(', ')}</span></p>}
                                {log.successes.length > 0 && <p className="text-gray-500">Successes: <span className="text-gray-300">{log.successes.join(', ')}</span></p>}
                                {log.directives.length > 0 && <p className="text-gray-500">Directives: <span className="text-gray-300">{log.directives.join(', ')}</span></p>}
                            </div>
                        ))}
                    </div>
                ) : (
                     <p className="text-sm text-center text-gray-500 py-2">No memory logs yet. Tweak some videos to teach the AI!</p>
                )}
                
                <div className="pt-2">
                    <button onClick={handleClear} disabled={logs.length === 0} className="w-full text-xs py-2 px-3 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 disabled:opacity-50 transition-colors">
                        Clear Memory Log
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DirectorMemoryManager;