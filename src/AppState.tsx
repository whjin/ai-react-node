import React, { useState, createContext, type ReactNode } from 'react';

interface AppStateValue {
  username: string;
  shoppingCart: { items: { id: string | number; name: string }[] };
}

interface AppStateProviderProps {
  children: ReactNode;
}

const defaultContextValue = {
  username: '李尔豪',
  shoppingCart: { items: [] },
};

export const appContext = createContext<AppStateValue>(defaultContextValue);
export const appSetStateContext = createContext<
  React.Dispatch<React.SetStateAction<AppStateValue>> | undefined
>(undefined);

export const AppStateProvider: React.FC<AppStateProviderProps> = (props) => {
  const [state, setState] = useState<AppStateValue>(defaultContextValue);

  return (
    <appContext.Provider value={state}>
      <appSetStateContext.Provider value={setState}>
        {props.children}
      </appSetStateContext.Provider>
    </appContext.Provider>
  );
};
