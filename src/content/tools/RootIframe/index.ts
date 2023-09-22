const iframe = document.createElement('iframe');

function applyCSS(iframe: HTMLIFrameElement) {
	iframe.setAttribute('style', 'display: none');
    iframe.contentWindow!.document.body.setAttribute('style', 'margin: 0; background-color: #1b1b1b; overflow: hidden;');
    
    let link = document.createElement('link');
    link.href = chrome.runtime.getURL(`/content.bundle.css`); 
    link.rel = 'stylesheet'; 
    link.type = 'text/css'; 
    iframe.contentWindow!.document.head.appendChild(link);
}
function initialize() {
	document.documentElement.append(iframe);
	iframe.setAttribute('id', 'desk');
	applyCSS(iframe);

	const docIframe = iframe.contentDocument!;
	const app = docIframe.createElement('div');
	app.setAttribute('id', 'app');
	docIframe.body.append(app);
}
initialize();


export function getWindowFromIframe(): Window {
	return iframe.contentWindow!;
}
export function getDocumentFromIframe(): Document {
	return iframe.contentDocument!;
}
export function getAppFromIframe(): HTMLDivElement {
	return iframe.contentDocument!.querySelector('div#app')!;
}

export function displayIframe() {
	iframe.removeAttribute('style');
}
export function hideIframe() {
	iframe.setAttribute('style', 'display: none');
}

export function addGlobalListener<T extends keyof WindowEventMap>(type: T, listener: (this: Window, ev: WindowEventMap[T]) => void) {
	window.addEventListener(type, listener);

	const windowIframe = getWindowFromIframe();
	windowIframe.addEventListener(type, listener);
}
export function removeGlobalListener<T extends keyof WindowEventMap>(type: T, listener: (this: Window, ev: WindowEventMap[T]) => void) {
	window.removeEventListener(type, listener);

	const windowIframe = getWindowFromIframe();
	windowIframe.removeEventListener(type, listener);
}