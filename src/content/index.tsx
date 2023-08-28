import { createRoot } from 'react-dom/client';

import { getDocumentFromIframe } from './tools/rootIframe';
import App from './app';
import './index.css';


createRoot(getDocumentFromIframe().body).render(<App />);