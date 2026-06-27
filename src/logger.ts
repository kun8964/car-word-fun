const PREFIX = '[CCA]';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  tag: string;
  message: string;
  data?: unknown;
  timestamp: number;
}

class Logger {
  private enabled = import.meta.env.DEV;
  private buffer: LogEntry[] = [];
  private maxBuffer = 200;

  private log(level: LogLevel, tag: string, message: string, data?: unknown) {
    if (!this.enabled) return;
    const entry: LogEntry = { level, tag, message, data, timestamp: Date.now() };
    this.buffer.push(entry);
    if (this.buffer.length > this.maxBuffer) this.buffer.shift();

    const time = new Date(entry.timestamp).toLocaleTimeString();
    const color = level === 'error' ? '#ef4444' : level === 'warn' ? '#f59e0b' : level === 'info' ? '#3b82f6' : '#6b7280';
    const style = `color:${color};font-weight:bold`;
    console.log(
      `%c${PREFIX} %c[${tag}] %c${message}`,
      style, 'color:#8b5cf6', 'color:inherit',
      data ?? '',
    );
  }

  debug(tag: string, message: string, data?: unknown) { this.log('debug', tag, message, data); }
  info(tag: string, message: string, data?: unknown) { this.log('info', tag, message, data); }
  warn(tag: string, message: string, data?: unknown) { this.log('warn', tag, message, data); }
  error(tag: string, message: string, data?: unknown) { this.log('error', tag, message, data); }

  getBuffer(): LogEntry[] { return [...this.buffer]; }
  clear() { this.buffer = []; }

  /** Dump buffer as a downloadable JSON file */
  dump() {
    const blob = new Blob([JSON.stringify(this.buffer, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cca-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const logger = new Logger();
