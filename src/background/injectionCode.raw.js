function done(){
    chrome.runtime.sendMessage({
        task: 'clear code',
    });
}

function sleep(ms){
    return new Promise((resolve) => setTimeout(resolve, ms));
}