import React, { FC, useEffect, useState } from 'react';

import { addGlobalListener, displayIframe, hideIframe, removeGlobalListener } from '../../tools/RootIframe';
import Keep from '../Keep';
import Units from '../Units';
import style from './index.scss';


function read(setDisplayState: (displayState: boolean) => void): void {
	chrome.storage.local.get('displayState', (result) => {
		setDisplayState(result.displayState ?? true);
	});
}
function store(displayState: boolean): void {
	chrome.storage.local.set({ 'displayState': displayState }, () => {
		chrome.runtime.sendMessage({
			task: 'update display state',
			displayState: displayState,
		});
	});
}


const Desk: FC = () => {
	const [keep, setKeep] = useState('');


	const [isDisplayed, setDisplayState] = useState(false);
	useEffect(() => {
		read(setDisplayState);
		chrome.runtime.onMessage.addListener((request) => {
			if (request.task === 'update display state') read(setDisplayState);
		});
	}, [])

	const setShortcutKey = (event: KeyboardEvent) => {
		if (event.ctrlKey && event.altKey) {
			store(!isDisplayed);
			setDisplayState(!isDisplayed);
		}
	}
	useEffect(() => {
		isDisplayed? displayIframe() : hideIframe();
		addGlobalListener('keydown', setShortcutKey);
		return () => removeGlobalListener('keydown', setShortcutKey);
	}, [isDisplayed])


	const PreventingFlickeringContentUntilScssIsLoaded = (
		<div
			style={{
				width: '1px',
				height: '120px',
			}}
		/>
	)
	return (
		<div
			className={style.div}
		>
			{PreventingFlickeringContentUntilScssIsLoaded}
			<nav>
				<a
					href='https://sninjo.com/'
					target='_blank'
					rel="noreferrer"
					title='SNinjo Personal Website'
				>
					<img
						src={chrome.runtime.getURL(`/icons/SNinjo.png`)}
						alt='SNinjo Personal Website'
					/>
				</a>
				<a
					href='https://blog.sninjo.com/'
					target='_blank'
					rel="noreferrer"
					title='SNinjo Blog'
				>
					<img
						src={chrome.runtime.getURL(`/icons/blog.png`)}
						alt='SNinjo Blog'
					/>
				</a>
				<a
					href='https://tool.sninjo.com/'
					target='_blank'
					rel="noreferrer"
					title='SNinjo Tool'
				>
					<img
						src={chrome.runtime.getURL(`/icons/tool.png`)}
						alt='SNinjo Tool'
					/>
				</a>
				<a
					href='https://github.com/SNinjo/desk'
					target='_blank'
					rel="noreferrer"
					title='Desk · GitHub'
				>
					<img
						src={chrome.runtime.getURL(`/icons/desk.png`)}
						alt='Desk'
					/>
				</a>
			</nav>
			<Keep
				keep={keep}
				setKeep={setKeep}
			/>
			<Units
				keep={keep}
			/>
		</div>
	)
}

export default Desk;