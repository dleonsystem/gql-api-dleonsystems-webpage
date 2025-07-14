export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const levelEnv = (process.env.LOG_LEVEL || 'info').toLowerCase();
const currentLevel: LogLevel =
  levelEnv === 'debug' || levelEnv === 'info' || levelEnv === 'warn' || levelEnv === 'error'
    ? (levelEnv as LogLevel)
    : 'info';

const levels: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

function shouldLog(lvl: LogLevel): boolean {
  return levels[lvl] <= levels[currentLevel];
}

const logger = {
  error: (...args: unknown[]) => {
    if (shouldLog('error')) console.error(...args);
  },
  warn: (...args: unknown[]) => {
    if (shouldLog('warn')) console.warn(...args);
  },
  info: (...args: unknown[]) => {
    if (shouldLog('info')) console.log(...args);
  },
  debug: (...args: unknown[]) => {
    if (shouldLog('debug')) console.debug(...args);
  },
};

export default logger;
