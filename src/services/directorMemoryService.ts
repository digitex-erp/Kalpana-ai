// FILE: src/services/directorMemoryService.ts
import { MemoryEntry } from '../types';

const STORAGE_KEY = "dailyso_director_memory";
const MAX_ENTRIES = 7; // Keep last 7 days of logs

export function loadMemory(): MemoryEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Saves or merges a memory entry for the current day.
 * If an entry for today already exists, it merges the new data.
 * Otherwise, it creates a new entry for today.
 * @param entry The memory data to save for today.
 */
export function saveMemoryEntry(entry: Omit<MemoryEntry, 'timestamp' | 'date'>) {
  const logs = loadMemory();
  
  const today = new Date().toISOString().split('T')[0];
  const existingTodayEntryIndex = logs.findIndex(log => log.date === today);

  if (existingTodayEntryIndex > -1) {
      // Merge with today's entry, avoiding duplicates
      const existingEntry = logs[existingTodayEntryIndex];
      existingEntry.projects = [...new Set([...existingEntry.projects, ...entry.projects])];
      existingEntry.feedback = [...new Set([...existingEntry.feedback, ...entry.feedback])];
      existingEntry.successes = [...new Set([...existingEntry.successes, ...entry.successes])];
      existingEntry.directives = [...new Set([...existingEntry.directives, ...entry.directives])];
      existingEntry.timestamp = Date.now();
  } else {
      // Add new entry for today
      const newEntry: MemoryEntry = {
          ...entry,
          date: today,
          timestamp: Date.now(),
      };
      logs.push(newEntry);
  }
  
  const trimmed = logs
      .sort((a, b) => b.timestamp - a.timestamp) // sort by most recent
      .slice(0, MAX_ENTRIES);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function formatMemoryForPrompt(): string {
  const logs = loadMemory();
  if (!logs.length) return "No memory logs found. This is the first session.";
  return logs
    .map(
      (l) => `
---
### 🧠 AI DIRECTOR DAILY MEMORY LOG
SESSION DATE: ${l.date}

PROJECTS PROCESSED: [${l.projects.join(", ")}]
KEY FEEDBACK & TWEAKS:
${l.feedback.map((f) => `• "${f}"`).join("\n") || "• None"}
SUCCESSFUL OUTCOMES:
${l.successes.map((s) => `• ${s}`).join("\n") || "• None"}
ACTIONABLE DIRECTIVES FOR FUTURE:
${l.directives.map((d) => `• ${d}`).join("\n") || "• None"}
---`
    )
    .join("\n");
}

export function clearMemory() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.error("Failed to clear memory from localStorage", e);
    }
}