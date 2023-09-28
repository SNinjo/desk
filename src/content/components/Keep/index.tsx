import React, { FC, useEffect, useRef, useState } from 'react';

import { getText, Outward } from '../../tools/Element';
import { getDocumentFromIframe, addGlobalListener, removeGlobalListener } from '../../tools/RootIframe';
import style from './index.scss';


function read(setKeep: (keep: string) => void): void {
	chrome.storage.local.get('keep', (result) => {
		setKeep(result.keep ?? '');
	});
}
function store(keep: string): void {
	chrome.storage.local.set({ 'keep': keep }, () => {
		chrome.runtime.sendMessage({
			task: 'update keep',
			keep: keep,
		});
	});
}

// function disableEvent(event: MouseEvent) {
// 	event.preventDefault();
// 	event.stopPropagation();
// }


interface iProps {
    keep: string,
    setKeep: (keep: string) => void,
}
const Keep: FC<iProps> = ({ keep, setKeep }) => {
	const [regexSelecting, setRegexSelecting] = useState(new RegExp('(.*)'));
	useEffect(() => {
		fetch(  chrome.runtime.getURL('/config/index.json')  )
			.then(response => response.json())
			.then(config => setRegexSelecting(new RegExp(config.regexKeepSelectingFromElement)))
	}, []);


	const [isSelecting, setSelectionState] = useState(false);

	const borderWidthHoveredElementMarker = 2;
	const [outwardHoveredElement, setOutwardOfHoveredElement] = useState(new Outward({
		x: -(borderWidthHoveredElementMarker * 2),
		y: -(borderWidthHoveredElementMarker * 2)
	}));
	const selectorHoveredElementMarker = '#hoveredElementMarker';
	const getHoveredElementMarker = () => {
		return document.querySelector(selectorHoveredElementMarker);
	}
	const createHoveredElementMarker = () => {
		const divElement = document.createElement('div');
		divElement.setAttribute('id', selectorHoveredElementMarker.replace(/^#/, ''));
		divElement.setAttribute('style', `
			position: fixed;
			z-index: 2147483646;

			border: dashed ${borderWidthHoveredElementMarker}px #e57effb0;
			background-color: #7ea7ffb0;

			pointer-events: none;
		`);
		document.body.append(divElement);
	}
	useEffect(() => {
		if (!getHoveredElementMarker()) {
			createHoveredElementMarker();
		}
	}, [])
	useEffect(() => {
		if (!isSelecting) {
			new Outward({
				x: -(borderWidthHoveredElementMarker * 2),
				y: -(borderWidthHoveredElementMarker * 2)
			}).setToElement(getHoveredElementMarker() as HTMLDivElement);
		}


		// 這樣設會使自己也收不到 click 的事件, 且須處理一開始就 hover 的問題
		// const classNameDisabledMouseEvent = 'disableMouseEvent';
		// const enableMouseEventForElements = () => {
		// 	document.querySelectorAll(`.${classNameDisabledMouseEvent}`).forEach(element => {
		// 		element.classList.remove(classNameDisabledMouseEvent);
		// 		(element as HTMLElement).removeEventListener('click', disableEvent);
		// 		(element as HTMLElement).removeEventListener('mousedown', disableEvent);
		// 		(element as HTMLElement).removeEventListener('mouseup', disableEvent);
		// 	});
		// }
		// const disableMouseEventForElement = (element: HTMLElement) => {
		// 	element.classList.add(classNameDisabledMouseEvent);
		// 	element.addEventListener('click', disableEvent);
		// 	element.addEventListener('mousedown', disableEvent);
		// 	element.addEventListener('mouseup', disableEvent);
		// }
		const hoverElement = (event: MouseEvent) => {
			const hoveredElement = event.target as HTMLElement;
			setOutwardOfHoveredElement(new Outward(hoveredElement.getBoundingClientRect()));

			// if (isSelecting) {
			// 	disableMouseEventForElement(hoveredElement);
			// }
		}

		// if (!isSelecting) {
		// 	enableMouseEventForElements();
		// }
		window.addEventListener('mouseover', hoverElement);
		return () => window.removeEventListener('mouseover', hoverElement);
	}, [isSelecting])
	useEffect(() => {
		if (isSelecting) {
			outwardHoveredElement.setToElement(getHoveredElementMarker() as HTMLDivElement);
		}
	}, [isSelecting, outwardHoveredElement])

	const clickElement: (event: Event) => void = (event) => {
		event.preventDefault();
		event.stopPropagation();

		const text = getText(event.target as HTMLElement);
		const parsedText = text.match(regexSelecting);
		const keep = parsedText? parsedText[1] : text;
		setKeep(keep);
		store(keep);
		console.log(`select | text: "${text}", regexSelecting: ${regexSelecting}, keep: "${keep}"`)//

		setSelectionState(false);
		return false;
	}
	useEffect(() => {
		if (isSelecting) {
			window.addEventListener('click', clickElement);
			return () => window.removeEventListener('click', clickElement);
		}
	}, [isSelecting])




	const copyKeep = (): void => {
		if (window.isSecureContext && navigator.clipboard) {
			navigator.clipboard.writeText(keep);
		} else {
            refInput.current!.select();
            getDocumentFromIframe().execCommand('copy');
            refInput.current!.blur();
		}
	}
	const pasteKeep = async (): Promise<void> => {
		let text = '';
		if (window.isSecureContext && navigator.clipboard) {
			text = await navigator.clipboard.readText();
		} else {
			const domDiv = document.createElement('div');
			domDiv.setAttribute('style', 'position: fixed; opacity: 0;');
			domDiv.contentEditable = 'true';
			document.body.append(domDiv);

			domDiv.focus();
			document.execCommand('paste');

			text = domDiv.innerText;
			domDiv.remove();
		}
		setKeep(text);
		store(text);
	}


	const [isClearButtonClicked, setClearButtonClickState] = useState(false);
	const [isCopyButtonClicked, setCopyButtonClickState] = useState(false);
	const [isPasteButtonClicked, setPasteButtonClickState] = useState(false);
	useEffect(() => {
		setTimeout(() => setClearButtonClickState(false), 2000);
	}, [isClearButtonClicked])
	useEffect(() => {
		setTimeout(() => setCopyButtonClickState(false), 2000);
	}, [isCopyButtonClicked])
	useEffect(() => {
		setTimeout(() => setPasteButtonClickState(false), 2000);
	}, [isPasteButtonClicked])


	const setShortcutKey = (event: KeyboardEvent) => {
		if (event.altKey) {
			switch (event.code) {
			case 'KeyZ':
				setKeep('');
				store('');
				setClearButtonClickState(true);
				break;
                
			case 'KeyX':
				setSelectionState(value => !value);
				break;

			case 'KeyC':
				copyKeep();
				setCopyButtonClickState(true);
				break;
                
			case 'KeyV':
				pasteKeep();
				setPasteButtonClickState(true);
				break;
			}
		}
	}
	useEffect(() => {
		addGlobalListener('keydown', setShortcutKey);
		return () => removeGlobalListener('keydown', setShortcutKey);
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
						className={isClearButtonClicked? style.clicked : ''}
						title='clear (alt + KeyZ)'

						onClick={() => { setKeep('');store(''); setClearButtonClickState(true); }}
					>
                        z
					</button>
					<button
						className={isSelecting? style.clicked : ''}
						title='select (alt + KeyX)'

						onClick={() => setSelectionState(value => !value)}
					>
                        x
					</button>
					<button
						className={isCopyButtonClicked? style.clicked : ''}
						title='copy (alt + KeyC)'

						onClick={() => { copyKeep(); setCopyButtonClickState(true); }}
					>
                        c
					</button>
					<button
						className={isPasteButtonClicked? style.clicked : ''}
						title='paste (alt + KeyV)'

						onClick={() => { pasteKeep(); setPasteButtonClickState(true); }}
					>
                        v
					</button>
				</section>
			</div>
		</div>
	)
}
export default Keep;