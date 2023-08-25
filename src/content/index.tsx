import { createRoot } from 'react-dom/client';

import App from './app';
import './index.css';


function applyCSS(iframe: HTMLIFrameElement) {
    iframe.setAttribute('style', 'display: none');
    iframe.contentWindow!.document.body.setAttribute('style', 'margin: 0; background-color: #1b1b1b; overflow: hidden;');
    
    let link = document.createElement("link");
    link.href = chrome.extension.getURL(`/content.bundle.css`); 
    link.rel = "stylesheet"; 
    link.type = "text/css"; 
    iframe.contentWindow!.document.head.appendChild(link);
}
function createIframe() {
    let iframe = document.createElement('iframe');
    document.documentElement.prepend(iframe);
    iframe.setAttribute('id', 'desk');
    applyCSS(iframe);
    return iframe.contentWindow!.document.body;
}
createRoot(createIframe()).render(<App />);


export function open() {
    document.querySelector('iframe#desk')!.removeAttribute('style');
}
export function close() {
    document.querySelector('iframe#desk')!.setAttribute('style', 'display: none');
}