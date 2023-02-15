import { FC, useEffect, useRef, useState } from 'react';
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
    const [isSelecting, setSelectionState] = useState(false);
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

            setSelectionState(false);
        }
    }
    useEffect(() => {
        if (isSelecting) {
            document.body.addEventListener('mouseover', hoverOnElement);
            document.body.addEventListener('click', clickOnSelectedElement);
        }
        return () => {
            clearSelectedElement();
            document.body.removeEventListener('mouseover', hoverOnElement);
            document.body.removeEventListener('click', clickOnSelectedElement);
        }
    }, [isSelecting])


    const [isCopyButtonClicked, setCopybuttonClickState] = useState(false);
    const [isPasteButtonClicked, setPastebuttonClickState] = useState(false);
    useEffect(() => {
        setTimeout(() => setCopybuttonClickState(false), 2000);
    }, [isCopyButtonClicked])
    useEffect(() => {
        setTimeout(() => setPastebuttonClickState(false), 2000);
    }, [isPasteButtonClicked])


    const setShortcutKey = (event: KeyboardEvent) => {
        if (event.altKey){
            switch (event.code){
                case 'KeyZ':
                    setKeep('');
                    store('');
                    break;
                
                case 'KeyX':
                    setSelectionState(value => !value);
                    break;

                case 'KeyC':
                    copy(keep);
                    setCopybuttonClickState(true);
                    break;
                
                case 'KeyV':
                    paste(setKeep)
                        .then((keep: string) => store(keep));
                    setPastebuttonClickState(true);
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
    
    const refInput = useRef<HTMLInputElement>(null);
    const updateKeepToInput = () => { refInput.current!.value = keep };
    useEffect(updateKeepToInput, [keep])


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
                <section>
                    <button
                        className={isSelecting? style.clicked : ''}

                        onClick={() => setSelectionState(true)}
                    >
                        select
                    </button>
                    <button
                        className={isCopyButtonClicked? style.clicked : ''}

                        onClick={() => { copy(keep); setCopybuttonClickState(true); }}
                    >
                        copy
                    </button>
                    <button
                        className={isPasteButtonClicked? style.clicked : ''}

                        onClick={() => { paste(setKeep); setPastebuttonClickState(true); }}
                    >
                        paste
                    </button>
                </section>
            </div>
        </div>
    )
}
export default Keep;