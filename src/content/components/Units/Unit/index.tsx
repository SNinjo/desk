import React, { FC, useEffect } from 'react';

import { addGlobalListener, removeGlobalListener } from '../../../tools/RootIframe';
import style from './index.scss';


export interface iUnit {
    name: string,
    icon: string,
    key: {
        code: string,
        alt: boolean,
        ctrl: boolean,
        shift: boolean,
    },
    link: string,
    script: string,
    linkUsingKeep: string,
    scriptUsingKeep: string,
}

interface Key {
    code: string,
    alt: boolean,
    ctrl: boolean,
    shift: boolean,
}
function toString(key: Key): string {
	return `${(key.ctrl)? `ctrl + ` : ''}${(key.shift)? `shirt + ` : ''}${(key.alt)? `alt + ` : ''}${key.code}`
}


interface iProps {
    config: iUnit,
    keep: string,
}
const Unit: FC<iProps> = ({ config, keep }) => {
	const sendTask = async () => {
		let link = config.link;
		let script = config.script;
		if (keep && config.linkUsingKeep) {
			link = config.linkUsingKeep.replace(/<keep>/g, encodeURI(keep));
			script = config.scriptUsingKeep;
		}
    
		chrome.runtime.sendMessage({
			task: 'open website',
			link,
			script,
		});
	}

	const setShortcutKey = (event: KeyboardEvent) => {
		if (!config.key.code) return;
		if (config.key.code !== event.code) return;
		if (config.key.alt && !event.altKey) return;
		if (config.key.ctrl && !event.ctrlKey) return;
		if (config.key.shift && !event.shiftKey) return;

		event.preventDefault();
		sendTask();
	}
	useEffect(() => {
		addGlobalListener('keydown', setShortcutKey);
		return () => removeGlobalListener('keydown', setShortcutKey);
	}, [keep])


	return (
		<div
			className={style.div}
			onClick={() => sendTask()}
		>
			<img
				title={`${config.name} (${toString(config.key)})`}
				alt={toString(config.key)}
				src={chrome.runtime.getURL(`/config/${config.icon}`)}
			/>
			<span>{config.name}</span>
		</div>
	)
}
export default Unit;