// Simple LogViewer component for debugging
import React, { useState, useEffect } from 'react';
import { logger, LogEntry, LogLevel } from '../services/logService';

export const LogViewer: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [filter, setFilter] = useState<LogLevel | 'ALL'>('ALL');
    const [search, setSearch] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        // Load initial logs
        setLogs(logger.getLogs());

        // Subscribe to new logs
        const unsubscribe = logger.subscribe((entry) => {
            setLogs(prev => [entry, ...prev]);
        });

        return unsubscribe;
    }, []);

    const filteredLogs = logs.filter(log => {
        const matchesFilter = filter === 'ALL' || log.level === filter;
        const matchesSearch = search === '' ||
            log.message.toLowerCase().includes(search.toLowerCase()) ||
            log.context.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getLevelIcon = (level: LogLevel) => {
        switch (level) {
            case LogLevel.SUCCESS: return '✅';
            case LogLevel.ERROR: return '❌';
            case LogLevel.WARNING: return '⚠️';
            case LogLevel.INFO: return 'ℹ️';
            case LogLevel.DEBUG: return '🔍';
            default: return '📝';
        }
    };

    const getLevelColor = (level: LogLevel) => {
        switch (level) {
            case LogLevel.SUCCESS: return '#10b981';
            case LogLevel.ERROR: return '#ef4444';
            case LogLevel.WARNING: return '#f59e0b';
            case LogLevel.INFO: return '#3b82f6';
            case LogLevel.DEBUG: return '#6b7280';
            default: return '#9ca3af';
        }
    };

    const exportLogs = () => {
        const text = logger.exportLogsAsText();
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kalpana-logs-${new Date().toISOString()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (!isExpanded) {
        return (
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 1000
            }}>
                <button
                    onClick={() => setIsExpanded(true)}
                    style={{
                        padding: '12px 20px',
                        background: '#1f2937',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        fontSize: '14px',
                        fontWeight: '500',
                    }}
                >
                    🔍 Debug Logs ({logs.length})
                </button>
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '600px',
            maxHeight: '500px',
            background: '#1f2937',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Header */}
            <div style={{
                padding: '16px',
                borderBottom: '1px solid #374151',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <h3 style={{ margin: 0, color: 'white', fontSize: '16px' }}>
                    🔍 Debug Logs ({filteredLogs.length})
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={exportLogs}
                        style={{
                            padding: '6px 12px',
                            background: '#374151',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                        }}
                    >
                        Export
                    </button>
                    <button
                        onClick={() => logger.clearLogs()}
                        style={{
                            padding: '6px 12px',
                            background: '#374151',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                        }}
                    >
                        Clear
                    </button>
                    <button
                        onClick={() => setIsExpanded(false)}
                        style={{
                            padding: '6px 12px',
                            background: '#374151',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                        }}
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #374151',
                display: 'flex',
                gap: '8px',
            }}>
                <input
                    type="text"
                    placeholder="Search logs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: '#374151',
                        border: '1px solid #4b5563',
                        borderRadius: '6px',
                        color: 'white',
                        fontSize: '12px',
                    }}
                />
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as LogLevel | 'ALL')}
                    style={{
                        padding: '8px 12px',
                        background: '#374151',
                        border: '1px solid #4b5563',
                        borderRadius: '6px',
                        color: 'white',
                        fontSize: '12px',
                    }}
                >
                    <option value="ALL">All Levels</option>
                    <option value={LogLevel.ERROR}>Errors</option>
                    <option value={LogLevel.WARNING}>Warnings</option>
                    <option value={LogLevel.SUCCESS}>Success</option>
                    <option value={LogLevel.INFO}>Info</option>
                    <option value={LogLevel.DEBUG}>Debug</option>
                </select>
            </div>

            {/* Logs */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px',
            }}>
                {filteredLogs.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        color: '#9ca3af',
                        padding: '40px 20px',
                        fontSize: '14px',
                    }}>
                        No logs found
                    </div>
                ) : (
                    filteredLogs.map(log => (
                        <div
                            key={log.id}
                            style={{
                                marginBottom: '8px',
                                padding: '10px',
                                background: '#374151',
                                borderRadius: '6px',
                                borderLeft: `3px solid ${getLevelColor(log.level)}`,
                                fontSize: '12px',
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '4px',
                            }}>
                                <span>{getLevelIcon(log.level)}</span>
                                <span style={{ color: '#9ca3af', fontSize: '11px' }}>
                                    {log.timestamp.toLocaleTimeString()}
                                </span>
                                <span style={{
                                    color: '#60a5fa',
                                    fontWeight: '500',
                                }}>
                                    {log.context}
                                </span>
                                {log.duration && (
                                    <span style={{
                                        color: '#10b981',
                                        fontSize: '11px',
                                    }}>
                                        ({log.duration}ms)
                                    </span>
                                )}
                            </div>
                            <div style={{ color: 'white', paddingLeft: '24px' }}>
                                {log.message}
                            </div>
                            {log.details && (
                                <details style={{ paddingLeft: '24px', marginTop: '4px' }}>
                                    <summary style={{
                                        color: '#9ca3af',
                                        cursor: 'pointer',
                                        fontSize: '11px',
                                    }}>
                                        Details
                                    </summary>
                                    <pre style={{
                                        color: '#d1d5db',
                                        fontSize: '10px',
                                        marginTop: '4px',
                                        overflow: 'auto',
                                    }}>
                                        {JSON.stringify(log.details, null, 2)}
                                    </pre>
                                </details>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
