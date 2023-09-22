import React, { FC, useEffect, useRef, useState } from 'react';

import Unit, { iUnit } from './Unit';
import style from './index.scss';


interface iProps {
    keep: string,
}
const Units: FC<iProps> = ({ keep }) => {
	const [arrUnitConfigs, setUnitConfigs] = useState<Array<iUnit>>([]);
	const load = () => {
		fetch(  chrome.runtime.getURL('/config/unit.json')  )
			.then(response => response.json())
			.then(data => setUnitConfigs(data))
	}
	useEffect(load, [])

	const [arrUnits, setUnits] = useState<Array<JSX.Element>>([]);
	const build = () => {
		let arrElements: Array<JSX.Element> = [];
		arrUnitConfigs.forEach((unit, index) => {
			arrElements.push(
				<Unit
					key={`unit${index}`}
					config={unit}
					keep={keep}
				/>
			)
		})
		setUnits(arrElements);
	}
	useEffect(build, [arrUnitConfigs, keep])


	const refContainer = useRef<HTMLDivElement>(null);
	const scrollHorizontalBar: (this: HTMLDivElement, event: WheelEvent) => void = (event: WheelEvent) => {
		event.preventDefault();
        refContainer.current!.scrollBy({  left: (event.deltaX + event.deltaY) * 0.5  });
	}
	useEffect(() => {
		let container = refContainer.current!;
		container.addEventListener('wheel', scrollHorizontalBar, { passive: false });
		return () => container.removeEventListener('wheel', scrollHorizontalBar);
	}, [])


	return (
		<div
			ref={refContainer}
			className={style.div}
		>
			<div>
				{(arrUnits.length !== 0)?
					<>{arrUnits}</>:
					<>
						<span>Empty...</span>
						<a
							href='https://github.com/SNinjo/desk#api'
							target='_blank'
							rel="noreferrer"
						>
							Set your own Unit!
						</a>
					</>
				}
			</div>
		</div>
	)
}
export default Units;