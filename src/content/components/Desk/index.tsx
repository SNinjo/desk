import { FC, useEffect, useState } from 'react';

import { open, close } from '../..';
import Keep from '../Keep';
import Units from '../Units';
import style from './index.scss';


function read(setDisplayState: Function): void {
    chrome.storage.local.get("displayState", (result) => {
        setDisplayState(result.displayState ?? true);
    });
}
function store(displayState: boolean): void {
    chrome.storage.local.set({ "displayState": displayState }, () => {
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
        if (event.ctrlKey && (event.code === 'KeyE')){
            event.preventDefault();
            chrome.runtime.sendMessage({
                task: 'open website',
                link: 'https://www.google.com',
                code: '',
            });
        }
        if (event.ctrlKey && event.altKey) {
            store(!isDisplayed);
            setDisplayState(!isDisplayed);
        }
    }
    useEffect(() => {
        isDisplayed? open() : close();
        window.addEventListener('keydown', setShortcutKey);
        return () => window.removeEventListener('keydown', setShortcutKey);
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
                >
                    <img
                        src={chrome.extension.getURL(`/icons/SNinjo.png`)}
                        alt='SNinjo personal website'
                    />
                </a>
                <a
                    href='https://blog.sninjo.com/'
                    target='_blank'
                >
                    <img
                        src={chrome.extension.getURL(`/icons/blog.png`)}
                        alt='SNinjo blog'
                    />
                </a>
                <a
                    href='https://github.com/SNinjo/desk'
                    target='_blank'
                >
                    <img
                        src={chrome.extension.getURL(`/icons/desk.png`)}
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