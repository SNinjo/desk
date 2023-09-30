function updateIcon(isDisplaying: boolean) {
	chrome.action.setIcon({
		path: `icons/desk${isDisplaying? '' : '_closed'}.png`,
	});
}
function sendUpdatingDisplayStateToEachTab() {
	chrome.tabs.query({}, (tabs) => {
		tabs.forEach(tab => {
			chrome.tabs.sendMessage((tab.id as number), {
				task: 'update display state'
			});
		});
	});
}
function getDisplayState(): Promise<boolean> {
	return new Promise(resolve => {
		chrome.storage.local.get('isDisplaying', ({ isDisplaying }) => {
			resolve(isDisplaying ?? true);
		});
	})
}
function setDisplayState(isDisplaying: boolean) {
	chrome.storage.local.set({ isDisplaying }, () => {
		sendUpdatingDisplayStateToEachTab();
		updateIcon(isDisplaying);
	});
}

chrome.action.onClicked.addListener(async () => {
	const isDisplaying = await getDisplayState();
	setDisplayState(!isDisplaying);
});

chrome.runtime.onMessage.addListener(async (request: {task: string}) => {
	if (request.task === 'update display state') {
		const isDisplaying = await getDisplayState();
		setDisplayState(isDisplaying);
	}
});




function sendUpdatingKeepToEachTab() {
	chrome.tabs.query({}, (tabs) => {
		tabs.forEach(tab => {
			chrome.tabs.sendMessage((tab.id as number), {
				task: 'update keep'
			});
		});
	});
}
async function getKeep(): Promise<string> {
	return new Promise(resolve => {
		chrome.storage.local.get('keep', ({ keep }) => {
			resolve(keep ?? '');
		});
	})
}


type Script = {
	link: string,
	path: string,
}
function toArray<KEY, VALUE>(map: Map<KEY, VALUE>): Array<[KEY, VALUE]> {
	const array: Array<[KEY, VALUE]> = [];
	map.forEach((value, key) => array.push([key, value]))
	return array;
}

async function getScriptsInTab(): Promise<Map<number, Script>> {
	return new Promise(resolve => {
		chrome.storage.local.get('scriptsInTab', ({ scriptsInTab }) => resolve(new Map(scriptsInTab)));
	});
}
async function setScriptsInTab(scriptsInTab: Map<number, Script>): Promise<void> {
	return new Promise(resolve => {
		chrome.storage.local.set({ scriptsInTab: toArray(scriptsInTab) }, resolve);
	});
}

async function addScript(tabId: number, script: Script): Promise<void> {
	const scriptsInTab = await getScriptsInTab();
	scriptsInTab.set(tabId, script);
	await setScriptsInTab(scriptsInTab);
}
async function getScript(tabId: number): Promise<Script | null> {
	const scriptsInTab = await getScriptsInTab();
	return scriptsInTab.get(tabId) ?? null;
}
async function removeScript(tabId: number): Promise<Script | null> {
	const removedScript = await getScript(tabId);

	const scriptsInTab = await getScriptsInTab();
	scriptsInTab.delete(tabId);
	await setScriptsInTab(scriptsInTab);

	return removedScript;
}


chrome.runtime.onMessage.addListener(async (request: {task: string}, sender) => {
	switch (request.task) {
	case 'update keep':
		sendUpdatingKeepToEachTab();
		break;

	case 'clear code':
		const tabId = sender.tab!.id!;
		const script = await removeScript(tabId);
		// eslint-disable-next-line no-console
		console.log(`[Desk][${tabId}] End script | path: "${script?.path ?? ''}"`);
		break;
	}
});

async function executeScriptWhenWebsiteLoaded(tabId: number, frameId: number) {
	const script = await getScript(tabId);
	if (script && script.path && (frameId === 0)) {
		const keep = await getKeep();
		// eslint-disable-next-line no-console
		console.log(`[Desk][${tabId}] Execute script | path: "${script.path}"`);
		chrome.scripting.executeScript({
			target: {
				tabId,
			},
			func: (...globalVariables: Array<[string, string | number]>) => {
				globalVariables.forEach(globalVariable => {
					(window[globalVariable[0] as keyof typeof window] as unknown) = globalVariable[1];
				})
			},
			args: [
				['keep', keep],
				['link', script.link],
				['script', script.path],
				['tabId', tabId],
			],
		});
		chrome.scripting.executeScript({
			target: {
				tabId,
			},
			files: [
				'scriptMethod.bundle.js',
				`/config/${script.path}`
			],
		})
	}
}
chrome.webNavigation.onCompleted.addListener((details) => executeScriptWhenWebsiteLoaded(details.tabId, details.frameId));


chrome.runtime.onMessage.addListener((request: {task: string, link: string, isTabActive?: boolean, script?: string}) => {
	if (request.task === 'open website') {
		chrome.tabs.create(
			{
				url: request.link,
				active: (request.isTabActive ?? true),
			},
			(tab) => {
				if (request.script) {
					addScript((tab.id as number), {
						link: request.link,
						path: request.script ?? '',
					});
				}
			}
		);
	}
});




async function getActivatedTabId(): Promise<number> {
	return new Promise(resolve => {
		chrome.tabs.query({active: true}, (tabs) => {
			resolve(tabs[0].id!)
		})
	})
}

chrome.runtime.onMessage.addListener(async (request: {task: string}, sender) => {
	if (request.task === 'is this tab activated') {
		const tabId = sender.tab!.id!;
		chrome.tabs.sendMessage(sender.tab!.id!, {
			task: `receive this tab state`,
			isThisTabActivated: (tabId === await getActivatedTabId()),
		});
	}
});
chrome.tabs.onActivated.addListener((activeInfo) => {
	chrome.tabs.sendMessage(activeInfo.tabId, {
		task: `activate tab`,
		tabId: activeInfo.tabId,
	});
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