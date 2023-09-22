export * from 'regular-listener';


export function done() {
	chrome.runtime.sendMessage({
		task: 'clear code',
	});
}

export function open(link: string, script: string) {
	chrome.runtime.sendMessage({
		task: 'open website',
		link: link,
		script: script,
	});
}

interface RequestParameter extends RequestInit {
    type: string,
}
export function fetchInBackground(url: string, parameter: RequestParameter) {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({
			task: `fetch: ${parameter.type}`,
			url,
			parameter,
		});

		const receiveData = (request: {task: string, data: string | JSON}) => {
			if (request.task === `receive ${parameter.type}`) {
				chrome.runtime.onMessage.removeListener(receiveData);
				resolve(request.data);
			}
		}
		chrome.runtime.onMessage.addListener(receiveData);
	});
}


export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}


export function insertText(element: HTMLElement, text: string) {
	element.focus();
	chrome.runtime.sendMessage({
		task: 'debugger: insert text',
		text,
	});
}
export async function selectOption(element: HTMLSelectElement, value: string) {
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