export function getText(element: HTMLElement): string {
	if (element.innerText) return element.innerText;
	if ((element instanceof HTMLInputElement) && (element.value)) return element.value;
	if ((element instanceof HTMLImageElement) && (element.alt)) return element.alt;
	if (element.getAttribute('aria-label')) return element.getAttribute('aria-label')!;
	return '';
}