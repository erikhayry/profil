//const VERSION = '1.0.0';
//Sentry.INIT_APP({ dsn: 'https://dd2362f7d005446585e6414b1662594e@sentry.io/1407701' });
//Sentry.configureScope((scope) => {
//    scope.setTag("version", VERSION);
//});

import {IClientUser, MESSAGE_TYPE, SUPPORTED_CLIENT} from "../typings/index";
import { browser } from "webextension-polyfill-ts";
import {getClient} from "../utils/client-handler";

interface IAppUserState {
    scrollY: number,
    scrollX: number
}

(function() {
    const APP_USER_KEY = 'profile-current-user';
    const APP_USER_STATE = 'profile-current-state';

    function isDiff(obj1: any, obj2: any){
        return JSON.stringify(obj1) !== JSON.stringify(obj2)
    }

    function updateData(){
        const client = getClient(location.host);
        const storageKeysWithData = client.dataKeys.map(dataKey => {
            return {
                key: dataKey,
                data: localStorage.getItem(dataKey)
            }
        });
        const userId = localStorage.getItem(APP_USER_KEY);
        const type = MESSAGE_TYPE.ADD_DATA_FOR_USER;

        browser.runtime.sendMessage({
            type,
            userId,
            storageKeysWithData,
            clientId: client.id
        }).then(handleSetDataResponse, handleError);

    }

    //window.setInterval(updateData, 5000);

    function handleSetDataResponse(user: IClientUser) {
        const { id: serverUserId, storageKeysWithData } = user;
        const clientUserId = localStorage.getItem(APP_USER_KEY);
        if(clientUserId !== serverUserId){
            localStorage.setItem(APP_USER_KEY, serverUserId);
            storageKeysWithData.forEach(({key, data} ) => {
                if(data){
                    localStorage.setItem(key, data);
                } else {
                    localStorage.removeItem(key);
                }
            });
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

    function handleInitResponse(user: IClientUser) {
        console.log("handleInitResponse", user);
        onLoad();
        const { id: serverUserId } = user;

        localStorage.setItem(APP_USER_KEY, serverUserId);
        browser.runtime.sendMessage({
            type: MESSAGE_TYPE.CURRENT_USER,
            userId: localStorage.getItem(APP_USER_KEY),
            client: SUPPORTED_CLIENT.SVT
        });

        user.storageKeysWithData.forEach(( {key, data} ) => {
            let reload = false;
            const clientUserData =  localStorage.getItem(key);
            if(data && (!clientUserData || isDiff(data, clientUserData))) {
                localStorage.setItem(key, data);
                reload = true;
            }
            if(reload){
                location.reload();
            }
        });


    }

    function handleChangeUser(user: IClientUser){
        const appUserState: IAppUserState = {
            scrollY: window.scrollY,
            scrollX: window.scrollX,
        };

        localStorage.setItem(APP_USER_KEY, user.id);
        localStorage.setItem(APP_USER_STATE, JSON.stringify(appUserState));

        user.storageKeysWithData.forEach(( {key, data} ) => {
            if(data){
                localStorage.setItem(key, data);
            } else {
                localStorage.removeItem(key);
            }
        });

        location.reload();
    }

    function handleError(error: string) {
        console.error(error)
    }

    browser.runtime.onMessage.addListener( ({ type, user } : { type: MESSAGE_TYPE, user: IClientUser}) => {
        switch(type) {
            case MESSAGE_TYPE.CURRENT_USER_FROM_BACKGROUND:
                handleChangeUser(user);
                break;
            case MESSAGE_TYPE.CURRENT_USER:
                console.log("sendMessage", type);
                browser.runtime.sendMessage({
                    type: MESSAGE_TYPE.INITIAL_STATE_RESPONSE,
                    userId: localStorage.getItem(APP_USER_KEY),
                    clientId: getClient(location.host)?.id
                });
                break;
            default:
                console.info('Unknown message type from background', type, user)
        }
    } );

    const client = getClient(location.host);
    browser.runtime.sendMessage({
            type: MESSAGE_TYPE.INIT_APP,
            clientId: client.id,
            userId: localStorage.getItem(APP_USER_KEY),
            storageKeysWithData: client.dataKeys.map(dataKey => {
                return {
                    key: dataKey,
                    data: localStorage.getItem(dataKey)
                }
            })
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
        => set user 1 as current with client data
    3.
        Host: no data, valid user
        Server: no data
        => do nothing
    4.
        Host: data, valid user
        Server: no data
        => add client data to server
    5.
       Host: no data. Invalid user
       Server: no data
        => set user 1 as current
    6.
       Host: data. Invalid user
       Server: no data
        => set user 1 as current with client data
    7.
        Host: no data, no user.
        Server: data
        => set user 1 as current, update client storage
    8.
        Host: data, no user
        Server: data
        => if user with no data add, else create new user with client data. Set as current.
    9.
        Host: no data, valid user
        Server: data
        => set client user as current. Update client storage
    10.
        Host: data, valid user
        Server: data
        => set client user as current. Update client storage
    11.
       Host: no data. Invalid user
       Server: data
        => set user 1 as current
    12.
       Host: data. Invalid user
       Server: data
        => if user with no data add, else create new user with client data. Set as current.

    13: Host data = {EMPTY}

 */

