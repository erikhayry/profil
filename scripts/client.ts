//const VERSION = '1.0.0';
//Sentry.INIT_APP({ dsn: 'https://dd2362f7d005446585e6414b1662594e@sentry.io/1407701' });
//Sentry.configureScope((scope) => {
//    scope.setTag("version", VERSION);
//});

import {CLIENT_APP_KEY, IClientUser, MESSAGE_TYPE} from "../typings/index";
import { browser } from "webextension-polyfill-ts";
import Messenger from "../utils/messenger";
import {isDiff} from "../utils/data-handler";

interface IAppUserState {
    scrollY: number,
    scrollX: number
}

(function() {
    function updateData(){
        Messenger.client.addDataForUser(location.host)
            .then(handleSetDataResponse, handleError);
    }

    function handleSetDataResponse(user: IClientUser) {
        console.log('handleSetDataResponse', user)
        const { id: serverUserId, storageKeysWithData = [] } = user;
        const clientUserId = localStorage.getItem(CLIENT_APP_KEY.APP_USER_KEY);
        if(clientUserId !== serverUserId){
            localStorage.setItem(CLIENT_APP_KEY.APP_USER_KEY, serverUserId);
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
        const prevAppUserState = JSON.parse(localStorage.getItem(CLIENT_APP_KEY.APP_USER_STATE)) as IAppUserState;

        if(prevAppUserState){
            localStorage.removeItem(CLIENT_APP_KEY.APP_USER_STATE);
            window.scrollTo(prevAppUserState.scrollX, prevAppUserState.scrollY)
        }
    }

    function handleInitResponse(user: IClientUser) {
        console.log("handleInitResponse", user);
        onLoad();
        const { id: serverUserId } = user;

        localStorage.setItem(CLIENT_APP_KEY.APP_USER_KEY, serverUserId);
        Messenger.client.currentUser(location.host);

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

        localStorage.setItem(CLIENT_APP_KEY.APP_USER_KEY, user.id);
        localStorage.setItem(CLIENT_APP_KEY.APP_USER_STATE, JSON.stringify(appUserState));

        user?.storageKeysWithData.forEach(( {key, data} ) => {
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

    //new MessengerListener()
    //    .onCURRENT_USER_FROM_BACKGROUND(handleChangeUser)
    //    .onCURRENT_USER(() => Messenger.client.initialStateRes(location.host))

    browser.runtime.onMessage.addListener( ({ type, user } : { type: MESSAGE_TYPE, user: IClientUser}) => {
        switch(type) {
            case MESSAGE_TYPE.CURRENT_USER_FROM_BACKGROUND:
                handleChangeUser(user);
                break;
            case MESSAGE_TYPE.CURRENT_USER:
                console.log("sendMessage", type);
                Messenger.client.initialStateRes(location.host);
                break;
            default:
                console.info('Unknown message type from background', type, user)
        }
    });


    /*
        INIT CLIENT
     */
    Messenger.client.initAppReq(location.host)
        .then(handleInitResponse, handleError);
    window.setTimeout(updateData, 5000);
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

