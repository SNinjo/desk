import ReactDOM from 'react-dom';

import App from './app';
import './index.css';


function createRoot(){
    let rootElement = document.createElement('desk');
    document.documentElement.prepend(rootElement);
    return rootElement;
}
ReactDOM.render(<App />, createRoot());