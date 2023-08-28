import injectionCode from './injectionCode.raw.js';




function updateIcon(displayState) {
    if (displayState) {
        chrome.action.setIcon({
            path: 'icons/desk.png'
        });
    }
    else {
        chrome.action.setIcon({
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

chrome.action.onClicked.addListener(() => {
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




const mapCodesInEachTab = new Map();
function injectConstant(name, value) {
    return `const ${name} = \`${value.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;`;
}
function injectMainCode(code) {
    return `(async function (){ ${code} })()`;
}

(function initKeep() {
    chrome.storage.local.get("keep", (result) => {
        chrome.storage.local.set({ "keep": result.keep ?? '' });
    });
})();
function updateKeepInEachTab() {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
                task: 'update keep'
            });
        });
    });
}

chrome.runtime.onMessage.addListener((request, sender) => {
    switch (request.task){
        case 'update keep':
            updateKeepInEachTab();
            break;

        case 'clear code':
            let tabId = sender.tab.id;
            if (mapCodesInEachTab.has(tabId)) mapCodesInEachTab.delete(tabId);
            break;
    }
});
chrome.webNavigation.onCompleted.addListener((details) => {
    if ((details.frameId === 0) && (mapCodesInEachTab.has(details.tabId))) {
        let { link, code } = mapCodesInEachTab.get(details.tabId);
        chrome.storage.local.get("keep", (result) => {
			const test = () => {
				eval('console.log("test")');
			}
			console.log('run test')//
			chrome.scripting.executeScript({
				target: {  tabId: details.tabId  },
				func: test,
			})
            // chrome.scripting.executeScript(details.tabId, {
            //     code: `${injectionCode} \n${injectConstant('keep', result.keep)} \n${injectConstant('link', link)} \n${injectConstant('code', code)} \n${injectMainCode(code)}`
            // });
        });
    }
});




chrome.runtime.onMessage.addListener((request) => {
    if (request.task === 'open website') {
        chrome.tabs.create({ url: request.link }, (tab) => {
            mapCodesInEachTab.set(tab.id, { link: request.link, code: request.code });
        });
    }
});