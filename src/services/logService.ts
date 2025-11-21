// Centralized logging service for tracking AI/API usage and errors

export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    SUCCESS = 'SUCCESS',
    WARNING = 'WARNING',
    ERROR = 'ERROR',
}

export interface LogEntry {
    id: string;
    timestamp: Date;
    level: LogLevel;
    context: string;
    message: string;
    details?: any;
    duration?: number;
}

class LogService {
    private logs: LogEntry[] = [];
    private readonly MAX_LOGS = 1000;
    private readonly STORAGE_KEY = 'kalpana_logs';
    private enabled: boolean = true;

    constructor() {
        this.loadLogs();
    }

    private generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private addLog(level: LogLevel, context: string, message: string, details?: any, duration?: number) {
        if (!this.enabled) return;

        const entry: LogEntry = {
            id: this.generateId(),
            timestamp: new Date(),
            level,
            context,
            message,
            details,
            duration,
        };

        this.logs.unshift(entry); // Add to beginning for newest first

        // Limit log size
        if (this.logs.length > this.MAX_LOGS) {
            this.logs = this.logs.slice(0, this.MAX_LOGS);
        }

        this.saveLogs();
        this.notifyListeners(entry);
    }

    debug(context: string, message: string, details?: any) {
        this.addLog(LogLevel.DEBUG, context, message, details);
    }

    info(context: string, message: string, details?: any) {
        this.addLog(LogLevel.INFO, context, message, details);
    }

    success(context: string, message: string, duration?: number, details?: any) {
        this.addLog(LogLevel.SUCCESS, context, message, details, duration);
    }

    warning(context: string, message: string, details?: any) {
        this.addLog(LogLevel.WARNING, context, message, details);
    }

    error(context: string, message: string, error?: any) {
        const details = error ? {
            message: error.message,
            stack: error.stack,
            ...error,
        } : undefined;
        this.addLog(LogLevel.ERROR, context, message, details);
    }

    // Get all logs
    getLogs(): LogEntry[] {
        return [...this.logs];
    }

    // Get logs filtered by level
    getLogsByLevel(level: LogLevel): LogEntry[] {
        return this.logs.filter(log => log.level === level);
    }

    // Get logs filtered by context
    getLogsByContext(context: string): LogEntry[] {
        return this.logs.filter(log => log.context.toLowerCase().includes(context.toLowerCase()));
    }

    // Search logs
    searchLogs(query: string): LogEntry[] {
        const lowerQuery = query.toLowerCase();
        return this.logs.filter(log =>
            log.message.toLowerCase().includes(lowerQuery) ||
            log.context.toLowerCase().includes(lowerQuery)
        );
    }

    // Clear all logs
    clearLogs() {
        this.logs = [];
        this.saveLogs();
    }

    // Enable/disable logging
    setEnabled(enabled: boolean) {
        this.enabled = enabled;
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    // Export logs as JSON
    exportLogsAsJSON(): string {
        return JSON.stringify(this.logs, null, 2);
    }

    // Export logs as text
    exportLogsAsText(): string {
        return this.logs.map(log => {
            const time = log.timestamp.toLocaleTimeString();
            const duration = log.duration ? ` (${log.duration}ms)` : '';
            return `[${log.level}] ${time} | ${log.context} | ${log.message}${duration}`;
        }).join('\n');
    }

    // Persistence
    private saveLogs() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
        } catch (error) {
            console.error('Failed to save logs to localStorage:', error);
        }
    }

    private loadLogs() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Convert timestamp strings back to Date objects
                this.logs = parsed.map((log: any) => ({
                    ...log,
                    timestamp: new Date(log.timestamp),
                }));
            }
        } catch (error) {
            console.error('Failed to load logs from localStorage:', error);
            this.logs = [];
        }
    }

    // Event listeners for real-time log updates
    private listeners: ((entry: LogEntry) => void)[] = [];

    subscribe(listener: (entry: LogEntry) => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notifyListeners(entry: LogEntry) {
        this.listeners.forEach(listener => {
            try {
                listener(entry);
            } catch (error) {
                console.error('Error in log listener:', error);
            }
        });
    }
}

// Singleton instance
export const logger = new LogService();

// Helper function to measure execution time
export async function withLogging<T>(
    context: string,
    operation: string,
    fn: () => Promise<T>
): Promise<T> {
    const startTime = performance.now();
    logger.info(context, `Starting: ${operation}`);

    try {
        const result = await fn();
        const duration = Math.round(performance.now() - startTime);
        logger.success(context, `Completed: ${operation}`, duration);
        return result;
    } catch (error: any) {
        const duration = Math.round(performance.now() - startTime);
        logger.error(context, `Failed: ${operation} (${duration}ms)`, error);
        throw error;
    }
}
