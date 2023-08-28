import { createRoot } from 'react-dom/client';

import { getAppFromIframe } from './tools/rootIframe';
import App from './app';
import './index.css';


createRoot(getAppFromIframe()).render(<App />);