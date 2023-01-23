import { CSSProperties, useEffect, useRef, useState } from 'react';
import style from './index.scss';


function copy(text: string): void {
    navigator.clipboard.writeText(text);
}
async function paste(setText: Function): Promise<string> {
    return navigator.clipboard.readText()
        .then(text => {
            setText(text)
            return text;
        })
}

function read(setKeep: Function): void {
    chrome.storage.local.get("keep", (result) => {
        setKeep(result.keep ?? '');
    });
}
function store(keep: string): void {
    chrome.storage.local.set({ "keep": keep });
    chrome.runtime.sendMessage({
        task: 'update keep',
    });
}


const Keep = (props: { keep: string, setKeep: Function }) => {
    const [buttonColor, setButtonColor] = useState('');
    const playCopyAnimation = () => {
        setButtonColor('#6aff65');
        setTimeout(() => setButtonColor(''), 2000);
    }


    const setShortcutKey = (event: KeyboardEvent) => {
        if (event.altKey){
            switch (event.code){
                case 'KeyC':
                    copy(props.keep);
                    playCopyAnimation();
                    break;
                
                case 'KeyV':
                    paste(props.setKeep)
                        .then((keep: string) => store(keep))
                    break;
            
                case 'KeyG':
                    props.setKeep('');
                    store('');
                    break;
            }
        }
    }
    useEffect(() => {
        window.addEventListener('keydown', setShortcutKey);
        return () => window.removeEventListener('keydown', setShortcutKey);
    })


    useEffect(() => {
        read(props.setKeep);
        chrome.runtime.onMessage.addListener((request) => {
            if (request.task === 'update keep') read(props.setKeep);
        });
    }, [])
    const change: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        let keep = event.target.value;
        props.setKeep(keep);
        store(keep);
    }
    const click: React.MouseEventHandler<HTMLButtonElement> = () => {
        copy(props.keep);
        playCopyAnimation();
    }
    
    const refInput = useRef<HTMLInputElement>(null);
    const updateKeepToInput = () => { refInput.current!.value = props.keep };
    useEffect(updateKeepToInput, [props.keep])


    const cssButton: CSSProperties = {
        color: buttonColor,
    }
    return (
        <div
            className={style.div}
        >
            <input
                ref={refInput}
                type='text'
                placeholder='<keep>'

                onChange={change}
            />
            <button
                style={cssButton}

                onClick={click}
            >
                copy
            </button>
        </div>
    )
}
export default Keep;