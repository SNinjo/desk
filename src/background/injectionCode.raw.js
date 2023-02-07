function done(){
    chrome.runtime.sendMessage({
        task: 'clear code',
    });
}

function sleep(ms){
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function until(check, run){
    let timeoutId = setTimeout(() => {
        throw new Error(`overtime (function until can't wait >10s)`);
    }, 10000)
    while (!check()) await sleep(500);
    clearTimeout(timeoutId);
    run();
}