import { useState, useEffect } from 'react';
// @ts-ignore
import browser from 'webextension-polyfill';
import {MESSAGE_TYPE, SUPPORTED_CLIENT} from "../../typings/index";

const useInitialClientState = () => {
    const [initialState, setInitialState] = useState<{
        currentUser: string,
        clientId: SUPPORTED_CLIENT
    } | undefined>(undefined);
    useEffect(() => {
        function updateAppState(clientId: SUPPORTED_CLIENT, userId: string) {
            setInitialState({
                clientId,
                currentUser: userId
            });
        }
        browser.runtime.onMessage.addListener( ({ type, userId, clientId} : {
            type: MESSAGE_TYPE,
            userId: string,
            clientId: SUPPORTED_CLIENT
        }) => {
            switch (type) {
                case MESSAGE_TYPE.INITIAL_STATE_RESPONSE:
                    updateAppState(clientId, userId)
            }
        });
        return () => browser.runtime.onMessage.removeEventListener(updateAppState);
    }, []);

    return initialState;
};


export default useInitialClientState;
