import injectionCode from './injectionCode.raw.js';


const mapCodes = new Map();
function injectConstant(name, value) {
    return `const ${name} = '${value}';`;
}
function injectMainCode(code) {
    return `(async function (){ ${code} })()`;
}

let keep = '';
chrome.storage.local.get("keep", (result) => {
    keep = result.keep ?? '';
})

chrome.runtime.onMessage.addListener((request, sender) => {
    switch (request.task){
        case 'open website':
            chrome.tabs.create({ url: request.link }, (tab) => {
                mapCodes.set(tab.id, request.code);
            });
            break;
            
        case 'update keep':
            keep = request.keep;
            chrome.tabs.query({}, (tabs) => {
                tabs.forEach(tab => {
                    chrome.tabs.sendMessage(tab.id, {
                        task: 'update keep'
                    });
                });
            });
            break;

        case 'clear code':
            let tabId = sender.tab.id;
            if (mapCodes.has(tabId)) mapCodes.delete(tabId);
            break;
    }
});
chrome.webNavigation.onCompleted.addListener((details) => {
    if ((details.frameId === 0) && (mapCodes.has(details.tabId))){
        chrome.tabs.executeScript(details.tabId, {
            code: `${injectionCode} \n${injectConstant('keep', keep)} \n${injectMainCode( mapCodes.get(details.tabId) )}`
        });
    }
});


chrome.browserAction.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, {task: 'click icon'})
});