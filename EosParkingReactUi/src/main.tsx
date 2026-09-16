import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { NavigationGuardProvider } from './pages/NavigationGuardContext';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
    <NavigationGuardProvider><App /></NavigationGuardProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
