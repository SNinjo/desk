export type LogLevel = 'info' | 'warn' | 'error';

export function log(level: LogLevel, tabId: number, message: string) {
	// eslint-disable-next-line no-console
	console[(level === 'info')? 'log' : level](`[Desk][${tabId}] ${message}`);
}