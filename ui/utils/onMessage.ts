import { useState, useEffect } from 'react';
// @ts-ignore
import browser from 'webextension-polyfill';
import {MESSAGE_TYPE} from "../../typings/index";

const useCurrentUser = () => {
    const [currentUser, setCurrentUser] = useState<string | undefined>(undefined);
    useEffect(() => {
        function updateUser(userId?: string) {
            console.log("updateUser", userId)
            setCurrentUser(userId);
        }
        browser.runtime.onMessage.addListener( ({ type, userId } : { type: MESSAGE_TYPE, userId: string}) => {
            console.log("onMessage", type, userId)
            switch (type) {
                case MESSAGE_TYPE.CURRENT_USER:
                    updateUser(userId)
            }
        });
        return () => browser.runtime.onMessage.removeEventListener(updateUser);
    }, []);

    return currentUser;
};


export default useCurrentUser;
