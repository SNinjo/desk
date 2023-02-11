import { CSSProperties, FC, useEffect, useRef, useState } from 'react';

import Keep from '../Keep';
import Units from '../Units';
import style from './index.scss';


function read(setDisplayState: Function): void {
    chrome.storage.local.get("displayState", (result) => {
        setDisplayState(result.displayState ?? true);
    });
}
function store(displayState: boolean): void {
    chrome.storage.local.set({ "displayState": displayState });
}

const Desk: FC = () => {
    const [keep, setKeep] = useState('');


    const isFirstRender = useRef(true);
    const [isDisplayed, setDisplayState] = useState(false);
    useEffect(() => {
        if (isFirstRender.current) isFirstRender.current = false;
        else store(isDisplayed);
    }, [isDisplayed]);

    useEffect(() => {
        read(setDisplayState);

        chrome.runtime.onMessage.addListener((request) => {
            if (request.task === 'click icon') setDisplayState(value => !value);
        });

        window.addEventListener('keydown', (event) => {
            if (event.ctrlKey && (event.code === 'KeyE')){
                event.preventDefault();
                chrome.runtime.sendMessage({
                    task: 'open website',
                    link: 'https://www.google.com',
                    code: '',
                });
            }
            if ((event.code === 'Space') && (event.ctrlKey || event.altKey)) setDisplayState(value => !value);
        });
    }, [])


    const css: CSSProperties = {
        display: (isDisplayed)? '' : 'none',
    }
    return (
        <div
            className={style.div}
            style={css}
        >
            <nav>
                {/* <a
                    href='https://sninjo.com/'
                    target='_blank'
                >
                    <img
                        src={chrome.extension.getURL(`/icons/SNinjo.png`)}
                        alt='SNinjo'
                    />
                </a> */}
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