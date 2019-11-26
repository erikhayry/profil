//const VERSION = '1.0.0';
//Sentry.INIT({ dsn: 'https://dd2362f7d005446585e6414b1662594e@sentry.io/1407701' });
//Sentry.configureScope((scope) => {
//    scope.setTag("version", VERSION);
//});

import {MESSAGE_TYPE} from "./background";
import {IUser} from "../utils/storage";
import {type} from "os";

interface IAppUserState {
    scrollY: number,
    scrollX: number
}

(function() {
    const HOST_DATA_KEY = 'persistent_state';
    const APP_USER_KEY = 'profile-current-user';
    const APP_USER_STATE = 'profile-current-state';
    const browser = require("webextension-polyfill");
    let prevData = {};

    function isDiff(obj1: any, obj2: any){
        return JSON.stringify(obj1) !== JSON.stringify(obj2)
    }

    function updateData(){
        console.log("updateData")
        const data = localStorage.getItem(HOST_DATA_KEY);
        const type = MESSAGE_TYPE.DATA;

        if(isDiff(prevData, data)){
            console.log('data updated', data)
            prevData = data;
            browser.runtime.sendMessage({type, data})
                .then(handleSetDataResponse, handleError);
        }
    }

    window.setInterval(updateData, 5000);

    function handleSetDataResponse({ id, data}: IUser) {
        console.log("on handleSetDataResponse", id, data)
    }

    function reload(userId: string){
        console.log('reload', userId)
        localStorage.setItem(APP_USER_KEY, userId);
        const appUserState: IAppUserState = {
            scrollY: window.scrollY,
            scrollX: window.scrollX,
        };
        localStorage.setItem(APP_USER_STATE, JSON.stringify(appUserState));
        location.reload();
    }

    function onLoad(){
        const prevAppUserState = JSON.parse(localStorage.getItem(APP_USER_STATE)) as IAppUserState;
        if(prevAppUserState){
            localStorage.removeItem(APP_USER_STATE);
            window.scrollTo(prevAppUserState.scrollX, prevAppUserState.scrollY)
        }
    }

    function handleInitResponse({ id, data: storedData }: IUser) {
        onLoad();
        const oldData = localStorage.getItem(HOST_DATA_KEY);
        console.log("on handleInitResponse", id, storedData);
        if(!storedData) {
            const currentUserId = localStorage.getItem(APP_USER_KEY);

            if(currentUserId !== id){
                console.log(" - no data, reset host");
                localStorage.removeItem(HOST_DATA_KEY);
                reload(id)
            }
        }
        else if(isDiff(oldData, storedData)){
            console.log(" - set data on host")
            localStorage.setItem(HOST_DATA_KEY, storedData);
            reload(id)
        }
    }

    function handleError(error: string) {
        console.log(`Error: ${error}`);
    }

    browser.runtime.onMessage.addListener( ({ type, userId } : { type: MESSAGE_TYPE, userId: string}) => {
        console.log("onMessage", type, userId)
        switch(type) {
            case MESSAGE_TYPE.CURRENT_USER:
                reload(userId);
                break;
            default:
                console.log('Unknown message type from background', type)
        }
    } );

    browser.runtime.sendMessage({type: MESSAGE_TYPE.INIT})
        .then(handleInitResponse, handleError);

}());

