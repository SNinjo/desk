import ReactDOM from 'react-dom';

import App from './app';
import './index.css';


function createRoot(id: string){
    let rootElement = document.createElement('div');
    rootElement.setAttribute('id', id);
    document.body.prepend(rootElement);
}

createRoot('desk');
ReactDOM.render(<App />, document.getElementById('desk'));