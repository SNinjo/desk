export function getText(element: HTMLElement): string {
	if (element.innerText) return element.innerText;
	if ((element instanceof HTMLInputElement) && (element.value)) return element.value;
	if ((element instanceof HTMLImageElement) && (element.alt)) return element.alt;
	if (element.getAttribute('aria-label')) return element.getAttribute('aria-label')!;
	return '';
}


export class Outward {
	x: number = 0;
	y: number = 0;
	width: number = 0;
	height: number = 0;


	constructor(object?: {x?: number, y?: number, left?: number, top?: number, width?: number, height?: number}) {
		if (!object) return;
		if (object.x) this.x = object.x;
		if (object.y) this.y = object.y;
		if (object.left) this.x = object.left;
		if (object.top) this.y = object.top;
		if (object.width) this.width = object.width;
		if (object.height) this.height = object.height;
	}

	setToElement(element: HTMLElement) {
		element.style.left = `${this.x}px`;
		element.style.top = `${this.y}px`;
		element.style.width = `${this.width}px`;
		element.style.height = `${this.height}px`;
	}
}