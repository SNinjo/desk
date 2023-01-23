import { useEffect } from 'react';
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
    code: string,
    linkUsingKeep: string,
    codeUsingKeep: string,
}
function fetchCode(link: string): Promise<string> {
    if (link === '') return new Promise(resolve => resolve(''));
    
    return fetch( chrome.extension.getURL(`/unit/codes/${link}`) )
        .then(response => response.text())
}
async function sendTask(config: iUnit, keep: string): Promise<void> {
    let link = config.link;
    let code = await fetchCode(config.code);
    if (keep && (keep !== '') && (config.linkUsingKeep !== '')){
        link = config.linkUsingKeep.replace(/<keep>/g, encodeURI(keep));
        code = (await fetchCode(config.codeUsingKeep)).replace(/<keep>/g, keep);
    }

    chrome.runtime.sendMessage({
        task: 'open website',
        link: link,
        code: code,
    });
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


const Unit = (props: {config: iUnit, keep: string}) => {
    const setShortcutKey = (event: KeyboardEvent) => {
        if (props.config.key.code !== event.code) return;
        if (props.config.key.alt && !event.altKey) return;
        if (props.config.key.ctrl && !event.ctrlKey) return;
        if (props.config.key.shift && !event.shiftKey) return;

        event.preventDefault();
        sendTask(props.config, props.keep);
    }
    useEffect(() => {
        window.addEventListener('keydown', setShortcutKey);
        return () => window.removeEventListener('keydown', setShortcutKey);
    }, [props.keep])


    return (
        <div
            className={style.div}
            onClick={() => sendTask(props.config, props.keep)}
        >
            <img
                title={`${props.config.name} (${toString(props.config.key)})`}
                alt={toString(props.config.key)}
                src={chrome.extension.getURL(`/unit/icons/${props.config.icon}`)}
            />
            <span>{props.config.name}</span>
        </div>
    )
}
export default Unit;