function done(){
    chrome.runtime.sendMessage({
        task: 'clear code',
    });
}