import { CSSProperties, FC, useEffect, useRef, useState } from 'react';
import style from './index.scss';
import './index.css';


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
        keep: keep
    });
}


interface iProps {
    keep: string,
    setKeep: Function,
}
const Keep: FC<iProps> = ({ keep, setKeep }) => {
    const [buttonColor, setButtonColor] = useState('');
    const playCopyAnimation = () => {
        setButtonColor('#6aff65');
        setTimeout(() => setButtonColor(''), 2000);
    }


    let isSelecting = false;
    let elementSelected: HTMLElement | null = null;
    const clearSelectedElement = () => {
        if (elementSelected) {
            elementSelected.classList.remove('selecting');
            elementSelected = null;
        }
    }
    const hoverOnElement: (this: HTMLElement, ev: MouseEvent) => any = (event) => {
        clearSelectedElement();
        elementSelected = event.target as HTMLElement;
        elementSelected.classList.add('selecting');
    }
    const clickOnSelectedElement: (this: HTMLElement, ev: MouseEvent) => any = (event) => {
        if (elementSelected) {
            event.preventDefault();

            setKeep(elementSelected.innerText);
            store(elementSelected.innerText);

            clearSelectedElement();
            document.body.removeEventListener('mouseover', hoverOnElement);
            document.body.removeEventListener('click', clickOnSelectedElement);
            isSelecting = false;
        }
    }

    const setShortcutKey = (event: KeyboardEvent) => {
        if (event.altKey){
            switch (event.code){
                case 'KeyZ':
                    setKeep('');
                    store('');
                    break;
                
                case 'KeyX':
                    clearSelectedElement();
                    isSelecting = !isSelecting;
                    if (isSelecting) {
                        document.body.addEventListener('mouseover', hoverOnElement);
                        document.body.addEventListener('click', clickOnSelectedElement);
                    }
                    else {
                        document.body.removeEventListener('mouseover', hoverOnElement);
                        document.body.removeEventListener('click', clickOnSelectedElement);
                    }
                    break;

                case 'KeyC':
                    copy(keep);
                    playCopyAnimation();
                    break;
                
                case 'KeyV':
                    paste(setKeep)
                        .then((keep: string) => store(keep))
                    break;
            }
        }
    }
    useEffect(() => {
        window.addEventListener('keydown', setShortcutKey);
        return () => window.removeEventListener('keydown', setShortcutKey);
    }, [keep, setKeep])


    useEffect(() => {
        read(setKeep);
        chrome.runtime.onMessage.addListener((request) => {
            if (request.task === 'update keep') read(setKeep);
        });
    }, [])
    const change: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        let keep = event.target.value;
        setKeep(keep);
        store(keep);
    }
    const click: React.MouseEventHandler<HTMLButtonElement> = () => {
        copy(keep);
        playCopyAnimation();
    }
    
    const refInput = useRef<HTMLInputElement>(null);
    const updateKeepToInput = () => { refInput.current!.value = keep };
    useEffect(updateKeepToInput, [keep])


    const cssButton: CSSProperties = {
        color: buttonColor,
    }
    return (
        <div
            className={style.div}
        >
            <div>
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
                {/* <button
                    style={cssButton}

                    onClick={click}
                >
                    paste
                </button> */}
            </div>
        </div>
    )
}
export default Keep;