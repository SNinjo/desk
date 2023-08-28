const iframe = document.createElement('iframe');

function applyCSS(iframe: HTMLIFrameElement) {
    iframe.setAttribute('style', 'display: none');
    iframe.contentWindow!.document.body.setAttribute('style', 'margin: 0; background-color: #1b1b1b; overflow: hidden;');
    
    let link = document.createElement("link");
    link.href = chrome.extension.getURL(`/content.bundle.css`); 
    link.rel = "stylesheet"; 
    link.type = "text/css"; 
    iframe.contentWindow!.document.head.appendChild(link);
}
function initialize() {
    document.documentElement.prepend(iframe);
    iframe.setAttribute('id', 'desk');
    applyCSS(iframe);
}
initialize();


export function getWindowFromIframe(): Window {
	return iframe.contentWindow!;
}
export function getDocumentFromIframe(): Document {
	return iframe.contentDocument!;
}
export function displayIframe() {
    iframe.removeAttribute('style');
}
export function hideIframe() {
    iframe.setAttribute('style', 'display: none');
}