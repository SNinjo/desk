import ReactDOM from 'react-dom/client';

import { getAppFromIframe } from './tools/RootIframe';
import App from './app';
import './index.css';


ReactDOM.createRoot(getAppFromIframe()).render(<App />);