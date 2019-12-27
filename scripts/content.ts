//const VERSION = '1.0.0';
//Sentry.INIT_APP({ dsn: 'https://dd2362f7d005446585e6414b1662594e@sentry.io/1407701' });
//Sentry.configureScope((scope) => {
//    scope.setTag("version", VERSION);
//});

import {IUser, MESSAGE_TYPE} from "../typings/index";

interface IAppUserState {
    scrollY: number,
    scrollX: number
}

(function() {
    const HOST_DATA_KEY = 'persistent_state';
    const APP_USER_KEY = 'profile-current-user';
    const APP_USER_STATE = 'profile-current-state';
    const browser = require("webextension-polyfill");

    function isDiff(obj1: any, obj2: any){
        return JSON.stringify(obj1) !== JSON.stringify(obj2)
    }

    function updateData(){
        const data = localStorage.getItem(HOST_DATA_KEY);
        const userId = localStorage.getItem(APP_USER_KEY);
        const type = MESSAGE_TYPE.ADD_DATA_FOR_USER;

        browser.runtime.sendMessage({
            type,
            userId,
            data
        }).then(handleSetDataResponse, handleError);

    }

    window.setInterval(updateData, 5000);

    function handleSetDataResponse(user: IUser) {
        const { id: serverUserId, data: serverUserData } = user;
        const hostUserId = localStorage.getItem(APP_USER_KEY);
        if(hostUserId !== serverUserId){
            localStorage.setItem(APP_USER_KEY, serverUserId);
            if(serverUserData){
                localStorage.setItem(HOST_DATA_KEY, serverUserData);
            } else {
                localStorage.removeItem(HOST_DATA_KEY);
            }
            location.reload();
        }
    }

    function onLoad(){
        const prevAppUserState = JSON.parse(localStorage.getItem(APP_USER_STATE)) as IAppUserState;

        if(prevAppUserState){
            localStorage.removeItem(APP_USER_STATE);
            window.scrollTo(prevAppUserState.scrollX, prevAppUserState.scrollY)
        }
    }

    function handleInitResponse(user: IUser) {
        onLoad();
        const { id: serverUserId, data: serverUserData } = user;
        const hostUserData = localStorage.getItem(HOST_DATA_KEY)
        const hostUserId = localStorage.getItem(APP_USER_KEY);

        localStorage.setItem(APP_USER_KEY, serverUserId);
        browser.runtime.sendMessage({type: MESSAGE_TYPE.CURRENT_USER, userId: localStorage.getItem(APP_USER_KEY)});

        if(serverUserData && (!hostUserData || isDiff(serverUserData, hostUserData))) {
            console.log('10');
            localStorage.setItem(HOST_DATA_KEY, serverUserData);
            location.reload();
        } else {
            //browser?.notifications?.create({
            //    "type": "basic",
            //    "iconUrl": browser.extension.getURL("icons/logo@2x.png"),
            //    "title": 'Profil',
            //    "message": `${user.name} är vald`
            //});
        }
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
        console.error(error)
    }

    browser.runtime.onMessage.addListener( ({ type, user } : { type: MESSAGE_TYPE, user: IUser}) => {
        switch(type) {
            case MESSAGE_TYPE.CURRENT_USER_FROM_BACKGROUND:
                handleChangeUser(user);
                break;
            case MESSAGE_TYPE.CURRENT_USER:
                browser.runtime.sendMessage({type, userId: localStorage.getItem(APP_USER_KEY)});
                break;
            default:
                console.info('Unknown message type from background', type, user)
        }
    } );

    browser.runtime.sendMessage({
            type: MESSAGE_TYPE.INIT_APP,
            userId: localStorage.getItem(APP_USER_KEY),
            data: localStorage.getItem(HOST_DATA_KEY)
        })
        .then(handleInitResponse, handleError);

}());

/*
    1.
        Host: no data, no user.
        Server: no data
        => set user 1 as current
    2.
        Host: data, no user
        Server no data
        => set user 1 as current with host data
    3.
        Host: no data, valid user
        Server: no data
        => do nothing
    4.
        Host: data, valid user
        Server: no data
        => add host data to server
    5.
       Host: no data. Invalid user
       Server: no data
        => set user 1 as current
    6.
       Host: data. Invalid user
       Server: no data
        => set user 1 as current with host data
    7.
        Host: no data, no user.
        Server: data
        => set user 1 as current, update host storage
    8.
        Host: data, no user
        Server: data
        => if user with no data add, else create new user with host data. Set as current.
    9.
        Host: no data, valid user
        Server: data
        => set host user as current. Update host storage
    10.
        Host: data, valid user
        Server: data
        => set host user as current. Update host storage
    11.
       Host: no data. Invalid user
       Server: data
        => set user 1 as current
    12.
       Host: data. Invalid user
       Server: data
        => if user with no data add, else create new user with host data. Set as current.

    13: Host data = {EMPTY}

 */

