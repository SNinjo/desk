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

(function initDisplayState() {
    chrome.storage.local.get("displayState", (result) => {
        setDisplayState(result.displayState ?? true);
    });
})();

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




const mapScriptInTab = new Map();

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
            if (mapScriptInTab.has(tabId)) mapScriptInTab.delete(tabId);
            break;
    }
});
chrome.webNavigation.onCompleted.addListener((details) => {
    if ((details.frameId === 0) && (mapScriptInTab.has(details.tabId))) {
        let { link, script } = mapScriptInTab.get(details.tabId);
        chrome.storage.local.get("keep", (result) => {
			chrome.scripting.executeScript({
				target: {
                    tabId: details.tabId,
                },
				func: (...globalVariables) => {
                    globalVariables.forEach(globalVariable => {
                        window[globalVariable[0]] = globalVariable[1];
                    })
                },
                args: [
                    ['keep', result.keep],
                    ['link', link],
                    ['script', script]
                ],
			})
			chrome.scripting.executeScript({
				target: {
                    tabId: details.tabId,
                },
                files: [
                    `injectionCode.js`,
                    `/config/${script}`
                ],
			})
        });
    }
});


chrome.runtime.onMessage.addListener((request) => {
    if (request.task === 'open website') {
        chrome.tabs.create({ url: request.link }, (tab) => {
            mapScriptInTab.set(tab.id, { link: request.link, script: request.script });
        });
    }
});




chrome.runtime.onMessage.addListener((request, sender) => {
    if (!request.task.startsWith('debugger: ')) return;
    
    chrome.debugger.attach({ tabId: sender.tab.id }, "1.2", async () => {
        switch (request.task){
            case 'debugger: insert text':
                await chrome.debugger.sendCommand({
                    tabId: sender.tab.id
                }, 'Input.insertText', {
                    text: request.text,
                });
                break;
            
            case 'debugger: press ArrowDown key':
                await chrome.debugger.sendCommand({ tabId: sender.tab.id }, "Input.dispatchKeyEvent", {
                    autoRepeat: false,
                    code: "ArrowDown",
                    isKeypad: false,
                    key: "ArrowDown",
                    location: 0,
                    modifiers: 0,
                    text: "",
                    type: "rawKeyDown",
                    unmodifiedText: "",
                    windowsVirtualKeyCode: 40
                })
                break;
        }
        
        await chrome.debugger.detach({ tabId: sender.tab.id });
    });
});