function done() {
    chrome.runtime.sendMessage({
        task: 'clear code',
    });
}

function open(link, script) {
    chrome.runtime.sendMessage({
        task: 'open website',
        link: link,
        script: script,
    });
}


function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function until(check, run) {
    let timeoutId = setTimeout(() => {
        throw new Error(`overtime (function until can't wait >10s)`);
    }, 10000)
    while (!check()) await sleep(500);
    clearTimeout(timeoutId);
    run();
}


function insertText(element, text) {
	element.focus();
    chrome.runtime.sendMessage({
        task: 'debugger: insert text',
		text,
    });
}
async function selectOption(element, value) {
    const arrValues = [...element.querySelectorAll('option')].map(option => option.value);
    const indexTarget = arrValues.findIndex(valueOption => (valueOption == value));

    element.value = '';
	element.focus();
    for (let index = -1; index < indexTarget; index++) {
        chrome.runtime.sendMessage({
            task: 'debugger: press ArrowDown key',
            value,
        });
    }
}