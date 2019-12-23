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
        const data = localStorage.getItem(HOST_DATA_KEY);
        const type = MESSAGE_TYPE.DATA;

        if(isDiff(prevData, data)){
            prevData = data;
            browser.runtime.sendMessage({type, data})
                .then(handleSetDataResponse, handleError);
        }
    }

    window.setInterval(updateData, 5000);

    function handleSetDataResponse({ id, data}: IUser) {
    }

    function onLoad(){
        const prevAppUserState = JSON.parse(localStorage.getItem(APP_USER_STATE)) as IAppUserState;

        if(prevAppUserState){
            localStorage.removeItem(APP_USER_STATE);
            window.scrollTo(prevAppUserState.scrollX, prevAppUserState.scrollY)
        }
    }

    function handleInitResponse({ id: serverUserId, data: serverUserData }: IUser) {
        onLoad();
        localStorage.setItem(APP_USER_KEY, serverUserId);
    }

    function handleChangeUser(user: IUser){
        const appUserState: IAppUserState = {
            scrollY: window.scrollY,
            scrollX: window.scrollX,
        };

        localStorage.setItem(APP_USER_KEY, user.id);
        localStorage.setItem(APP_USER_STATE, JSON.stringify(appUserState));
        if(user.data){
            localStorage.setItem(HOST_DATA_KEY, user.data);
        } else {
            localStorage.removeItem(HOST_DATA_KEY);
        }
        location.reload();
    }

    function handleError(error: string) {
    }

    browser.runtime.onMessage.addListener( ({ type, user } : { type: MESSAGE_TYPE, user: IUser}) => {
        switch(type) {
            case MESSAGE_TYPE.CURRENT_USER:
                handleChangeUser(user)
                break;
            default:
                console.log('Unknown message type from background', type, user)
        }
    } );

    browser.runtime.sendMessage({
            type: MESSAGE_TYPE.INIT,
            data: {
                id: localStorage.getItem(APP_USER_KEY),
                data: localStorage.getItem(HOST_DATA_KEY)
            }
        })
        .then(handleInitResponse, handleError);

}());

