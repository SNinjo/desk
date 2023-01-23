chrome.runtime.onMessage.addListener((request) => {
    switch (request.task){
        case 'open website':
            chrome.tabs.create({ url: request.link }, (tab) => {
                chrome.tabs.executeScript(tab.id, { 
                    code: request.code
                });
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

chrome.browserAction.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, {task: 'click icon'})
});