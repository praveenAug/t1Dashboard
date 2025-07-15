'use client';

import React, {ReactNode, useRef} from 'react';
import { Provider } from 'react-redux';
import { AppStore, makeStore } from './store';

interface ProviderProps {
    children: ReactNode;
}

export default function Providers({ children }: ProviderProps) {
    const storeRef = useRef<AppStore>();

    if(!storeRef.current) {
        storeRef.current = makeStore();
    }
    
    return <Provider store={storeRef.current}>{children}</Provider>
}