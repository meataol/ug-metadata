/**
 * Console logging utility with export functionality
 */

// Store all console logs
const logHistory = [];

// Override console methods to capture logs
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

console.log = function(...args) {
  logHistory.push({ type: 'log', timestamp: new Date().toISOString(), args });
  originalConsoleLog.apply(console, args);
};

console.warn = function(...args) {
  logHistory.push({ type: 'warn', timestamp: new Date().toISOString(), args });
  originalConsoleWarn.apply(console, args);
};

console.error = function(...args) {
  logHistory.push({ type: 'error', timestamp: new Date().toISOString(), args });
  originalConsoleError.apply(console, args);
};

// Export logs to text file
export function exportConsoleLogs() {
  const logText = logHistory.map(entry => {
    const timestamp = entry.timestamp;
    const type = entry.type.toUpperCase();
    const message = entry.args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
    return `[${timestamp}] [${type}] ${message}`;
  }).join('\n');
  
  const blob = new Blob([logText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `console-logs-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  originalConsoleLog('✅ Console logs exported to file');
}

// Make export function available globally
window.exportConsoleLogs = exportConsoleLogs;

originalConsoleLog('📋 Console export utility loaded. Use window.exportConsoleLogs() to export logs.');
