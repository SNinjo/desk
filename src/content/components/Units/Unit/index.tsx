import { FC, useEffect } from 'react';
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
async function fetchCode(link: string): Promise<string> {
    if (link === '') return new Promise(resolve => resolve(''));
    
    return fetch( chrome.extension.getURL(`/unit/codes/${link}`) )
        .then(response => response.text())
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
        let code = await fetchCode(config.code);
        if (keep && config.linkUsingKeep){
            link = config.linkUsingKeep.replace(/<keep>/g, encodeURI(keep));
            code = await fetchCode(config.codeUsingKeep);
        }
    
        chrome.runtime.sendMessage({
            task: 'open website',
            link: link,
            code: code,
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
        window.addEventListener('keydown', setShortcutKey);
        return () => window.removeEventListener('keydown', setShortcutKey);
    }, [keep])


    return (
        <div
            className={style.div}
            onClick={() => sendTask()}
        >
            <img
                title={`${config.name} (${toString(config.key)})`}
                alt={toString(config.key)}
                src={chrome.extension.getURL(`/unit/icons/${config.icon}`)}
            />
            <span>{config.name}</span>
        </div>
    )
}
export default Unit;