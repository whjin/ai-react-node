import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

const defaultContextValue = {
  username: '李尔豪',
};

export const appContext = React.createContext(defaultContextValue);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <appContext.Provider value={defaultContextValue}>
      <App />
    </appContext.Provider>
  </StrictMode>,
);
