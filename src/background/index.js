const mapCodes = new Map();
chrome.runtime.onMessage.addListener((request) => {
    switch (request.task){
        case 'open website':
            chrome.tabs.create({ url: request.link }, (tab) => {
                mapCodes.set(tab.id, request.code);
            });
            break;
            
        case 'update keep':
            chrome.tabs.query({}, (tabs) => {
                tabs.forEach(tab => {
                    chrome.tabs.sendMessage(tab.id, {
                        task: 'update keep'
                    });
                });
            });
            break;
    }
});
chrome.webNavigation.onCompleted.addListener((details) => {
    if ((details.frameId === 0) && (mapCodes.has(details.tabId))){
        chrome.tabs.executeScript(details.tabId, {
            code: mapCodes.get(details.tabId)
        });
    }
});


chrome.browserAction.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, {task: 'click icon'})
});