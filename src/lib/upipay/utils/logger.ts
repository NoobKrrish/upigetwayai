import type { LogLevel } from '../types.js';

export class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = 'info') {
    this.level = level;
  }

  debug(...args: any[]) {
    if (this.level === 'debug') console.debug('[UPIPay]', ...args);
  }

  info(...args: any[]) {
    if (this.level === 'debug' || this.level === 'info') console.info('[UPIPay]', ...args);
  }

  warn(...args: any[]) {
    if (this.level !== 'none') console.warn('[UPIPay]', ...args);
  }

  error(...args: any[]) {
    if (this.level !== 'none') console.error('[UPIPay]', ...args);
  }
}
