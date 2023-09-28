export * from 'regular-listener';


export function done() {
	chrome.runtime.sendMessage({
		task: 'clear code',
	});
}

export function open(link: string, isTabActive?: boolean, script?: string) {
	chrome.runtime.sendMessage({
		task: 'open website',
		link,
		isTabActive,
		script,
	});
}

export async function isThisTabActivated(): Promise<boolean> {
	return new Promise(resolve => {
		chrome.runtime.sendMessage({
			task: `is this tab activated`,
		});

		const receiveMessage = (request: {task: string, isThisTabActivated: boolean}) => {
			if (request.task === `receive this tab state`) {
				chrome.runtime.onMessage.removeListener(receiveMessage);
				resolve(request.isThisTabActivated);
			}
		}
		chrome.runtime.onMessage.addListener(receiveMessage);
	});
}
export async function onThisTabActivated(onTriggered: () => Promise<unknown>): Promise<void> {
	return new Promise(async resolve => {
		if (await isThisTabActivated()) {
			await onTriggered();
			resolve();
		} else {
			const receiveMessage = async (request: { task: string, tabId: number }) => {
				if ((request.task === 'activate tab') && (request.tabId === window.tabId)) {
					chrome.runtime.onMessage.removeListener(receiveMessage);
					await onTriggered();
					resolve();
				}
			}
			chrome.runtime.onMessage.addListener(receiveMessage);
		}
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

		const receiveMessage = (request: {task: string, data: string | JSON}) => {
			if (request.task === `receive ${parameter.type}`) {
				chrome.runtime.onMessage.removeListener(receiveMessage);
				resolve(request.data);
			}
		}
		chrome.runtime.onMessage.addListener(receiveMessage);
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
		});
	}
}