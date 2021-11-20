import { createContext, useContext, useState } from "react";

interface AppContextProps {
    loading: boolean
    setLoading: (active: boolean) => void
}

interface AppContextProviderProps {
    children: JSX.Element
}

// AppContext only ever used here, and will always be initialised in the AppContextProvider.
export const AppContext = createContext<AppContextProps>({} as AppContextProps);

export  function AppContextProvider(props: AppContextProviderProps) {
    const [loading, setLoading] = useState<boolean>(false);

    const context = {
        loading,
        setLoading
    };

    return <AppContext.Provider value={context}>{props.children}</AppContext.Provider>
}

export function useAppContext() {
    return useContext(AppContext) as AppContextProps;
}
