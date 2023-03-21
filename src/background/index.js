import injectionCode from './injectionCode.raw.js';




function updateIcon(displayState) {
    if (displayState) {
        chrome.browserAction.setIcon({
            path: 'icons/desk.png'
        });
    }
    else {
        chrome.browserAction.setIcon({
            path: 'icons/desk_closed.png'
        });
    }
}
function setDisplayState(displayState) {
    chrome.storage.local.set({ "displayState": displayState }, () => {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {
                    task: 'update display state'
                });
            });
        });
        updateIcon(displayState);
    });
}

function initDisplayState() {
    chrome.storage.local.get("displayState", (result) => {
        setDisplayState(result.displayState ?? true);
    });
}
initDisplayState();

chrome.browserAction.onClicked.addListener(() => {
    chrome.storage.local.get("displayState", (result) => {
        setDisplayState(  !(result.displayState ?? true)  );
    });
});

chrome.runtime.onMessage.addListener((request) => {
    if (request.task === 'update display state') {
        chrome.storage.local.get("displayState", (result) => {
            setDisplayState(result.displayState);
        });
    }
});




const mapCodes = new Map();
function injectConstant(name, value) {
    return `const ${name} = \`${value.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;`;
}
function injectMainCode(code) {
    return `(async function (){ ${code} })()`;
}

function initKeep() {
    chrome.storage.local.get("keep", (result) => {
        chrome.storage.local.set({ "keep": result.keep ?? '' });
    });
}
initKeep();

chrome.runtime.onMessage.addListener((request, sender) => {
    switch (request.task){
        case 'update keep':
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
    if ((details.frameId === 0) && (mapCodes.has(details.tabId))) {
        let { link, code } = mapCodes.get(details.tabId);
        chrome.storage.local.get("keep", (result) => {
            chrome.tabs.executeScript(details.tabId, {
                code: `${injectionCode} \n${injectConstant('keep', result.keep)} \n${injectConstant('link', link)} \n${injectConstant('code', code)} \n${injectMainCode(code)}`
            });
        });
    }
});




chrome.runtime.onMessage.addListener((request) => {
    if (request.task === 'open website') {
        chrome.tabs.create({ url: request.link }, (tab) => {
            mapCodes.set(tab.id, { link: request.link, code: request.code });
        });
    }
});