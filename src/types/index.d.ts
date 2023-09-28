export {};

declare global {
	interface Window {
		keep: string;
		link: string;
		script: string;
		tabId: number;
	}
}