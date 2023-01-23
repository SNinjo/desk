import { CSSProperties, useEffect, useState } from 'react';

import Unit, { iUnit } from '../Unit';
import Keep from '../Keep';
import style from './index.scss';


function fetchAllUnits(): Promise<Array<iUnit>> {
    let link = chrome.extension.getURL('/unit/index.json');
    return fetch(link)
        .then(response => response.json())
}

const Desk = () => {
    const [isDisplayed, setDisplayState] = useState(true);
    const [keep, setKeep] = useState('');

    useEffect(() => {
        chrome.runtime.onMessage.addListener((request) => {
            if (request.task === 'click icon') setDisplayState(value => !value);
        });

        window.addEventListener('keydown', (event) => {
            if (event.ctrlKey){
                switch (event.code){
                    case 'KeyE':
                        event.preventDefault();
                        chrome.runtime.sendMessage({
                            task: 'open website',
                            link: 'https://www.google.com',
                            code: '',
                        });
                        break;

                    case 'Space':
                        setDisplayState(value => !value);
                        break;
                }
            }
        });
    }, [])

    const [arrUnits, setUnits] = useState<Array<JSX.Element>>([]);
    useEffect(() => {
        fetchAllUnits()
            .then((data: Array<iUnit>) => {
                data.forEach((unit, index) => {
                    setUnits(array => [...array,
                        <Unit
                            key={`unit${index}`}
                            config={unit}
                            keep={keep}
                        />
                    ])
                })
            })
    }, [])
    // when changing the props of JSX.Element in array, it doesn't render and can't get the latest props value
    const forceUpdateKeep = () => arrUnits.forEach(unit => unit.props.keep = keep);
    useEffect(forceUpdateKeep, [keep])


    const css: CSSProperties = {
        display: (isDisplayed)? '' : 'none',
    }
    return (
        <div
            className={style.div}
            style={css}
        >
            <div>
                {
                    (arrUnits.length !== 0)?
                    <>
                        <Keep
                            keep={keep}
                            setKeep={setKeep}
                        />
                        {arrUnits}
                    </>:
                    <span>empty...</span>
                }
            </div>
        </div>
    )
}
export default Desk;