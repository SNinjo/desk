chrome.runtime.onMessage.addListener((request) => {
    if (request.task === 'open website')
        chrome.tabs.create({ url: request.link }, (tab) => {
            chrome.tabs.executeScript(tab.id, { 
                code: request.code
            });
        });
});

chrome.browserAction.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, {task: 'click icon'})
});