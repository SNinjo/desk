import { FC, useEffect, useState } from 'react';

import Unit, { iUnit } from './Unit';
import style from './index.scss';


interface iProps {
    keep: string,
}
const Units: FC<iProps> = ({ keep }) => {
    const [arrUnitConfigs, setUnitConfigs] = useState<Array<iUnit>>([]);
    const load = () => {
        let link = chrome.extension.getURL('/unit/index.json');
        fetch(link)
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


    return (
        <div
            className={style.div}
        >
            <div>
                {  (arrUnits.length !== 0)? <>{arrUnits}</> : <span>Empty...</span>  }
            </div>
        </div>
    )
}
export default Units;