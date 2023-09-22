function updateIcon(displayState: boolean) {
	if (displayState) {
		chrome.action.setIcon({
			path: 'icons/desk.png'
		});
	} else {
		chrome.action.setIcon({
			path: 'icons/desk_closed.png'
		});
	}
}
function setDisplayState(displayState: boolean) {
	chrome.storage.local.set({ displayState }, () => {
		chrome.tabs.query({}, (tabs) => {
			tabs.forEach(tab => {
				chrome.tabs.sendMessage((tab.id as number), {
					task: 'update display state'
				});
			});
		});
		updateIcon(displayState);
	});
}

(function initDisplayState() {
	chrome.storage.local.get('displayState', ({ displayState }) => {
		setDisplayState(displayState ?? true);
	});
})();

chrome.action.onClicked.addListener(() => {
	chrome.storage.local.get('displayState', ({ displayState }) => {
		setDisplayState(  !(displayState ?? true)  );
	});
});

chrome.runtime.onMessage.addListener((request: {task: string}) => {
	if (request.task === 'update display state') {
		chrome.storage.local.get('displayState', ({ displayState }) => {
			setDisplayState(displayState);
		});
	}
});




const mapScriptInTab = new Map<number, {link: string, script: string}>();

(function initKeep() {
	chrome.storage.local.get('keep', ({ keep }) => {
		chrome.storage.local.set({ 'keep': keep ?? '' });
	});
})();
function updateKeepInEachTab() {
	chrome.tabs.query({}, (tabs) => {
		tabs.forEach(tab => {
			chrome.tabs.sendMessage((tab.id as number), {
				task: 'update keep'
			});
		});
	});
}

chrome.runtime.onMessage.addListener((request: {task: string}, sender) => {
	switch (request.task) {
	case 'update keep':
		updateKeepInEachTab();
		break;

	case 'clear code':
		let tabId = sender.tab!.id!;
		if (mapScriptInTab.has(tabId)) mapScriptInTab.delete(tabId);
		break;
	}
});
chrome.webNavigation.onCompleted.addListener((details) => {
	if ((details.frameId === 0) && (mapScriptInTab.has(details.tabId))) {
		let { link, script } = mapScriptInTab.get(details.tabId)!;
		chrome.storage.local.get('keep', ({ keep }) => {
			chrome.scripting.executeScript({
				target: {
					tabId: details.tabId,
				},
				func: (...globalVariables: Array<[string, string]>) => {
					globalVariables.forEach(globalVariable => {
						(window[globalVariable[0] as keyof typeof window] as unknown) = globalVariable[1];
					})
				},
				args: [
					['keep', (keep as string)],
					['link', link],
					['script', script]
				],
			});
			chrome.scripting.executeScript({
				target: {
					tabId: details.tabId,
				},
				files: [
					'scriptMethod.bundle.js',
					`/config/${script}`
				],
			});
		});
	}
});


chrome.runtime.onMessage.addListener((request: {task: string, link: string, script?: string}) => {
	if (request.task === 'open website') {
		chrome.tabs.create({ url: request.link }, (tab) => {
			if (request.script) {
				mapScriptInTab.set((tab.id as number), { link: request.link, script: request.script });
			}
		});
	}
});




chrome.runtime.onMessage.addListener(async (request: {task: string, url: string, parameter: RequestInit & {type: string}}, sender) => {
	if (!request.task.startsWith('fetch: ')) return;

	const data = (
		await fetch(request.url, request.parameter)
			.then(async response => {
				switch (request.parameter.type) {
				case 'json':
					return response.json();
                    
				default:
					return response.text();
				}
			})
	);
	chrome.tabs.sendMessage(sender.tab!.id!, {
		task: `receive ${request.parameter.type}`,
		data,
	});
});


chrome.runtime.onMessage.addListener((request: {task: string, text?: string}, sender) => {
	if (!request.task.startsWith('debugger: ')) return;
    
	chrome.debugger.attach({ tabId: sender.tab!.id }, '1.2', async () => {
		switch (request.task) {
		case 'debugger: insert text':
			await chrome.debugger.sendCommand({
				tabId: sender.tab!.id
			}, 'Input.insertText', {
				text: request.text,
			});
			break;
            
		case 'debugger: press ArrowDown key':
			await chrome.debugger.sendCommand({ tabId: sender.tab!.id }, 'Input.dispatchKeyEvent', {
				autoRepeat: false,
				code: 'ArrowDown',
				isKeypad: false,
				key: 'ArrowDown',
				location: 0,
				modifiers: 0,
				text: '',
				type: 'rawKeyDown',
				unmodifiedText: '',
				windowsVirtualKeyCode: 40,
			})
			break;
		}
        
		await chrome.debugger.detach({ tabId: sender.tab!.id });
	});
});