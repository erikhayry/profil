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
        if(user){
            let reload = false;
            const { id: serverUserId, storageKeysWithData = [] } = user;
            const clientUserId = localStorage.getItem(CLIENT_APP_KEY.APP_USER_KEY);
            localStorage.setItem(CLIENT_APP_KEY.APP_USER_KEY, serverUserId);
            storageKeysWithData.forEach(({key, data} ) => {
                if(!data){
                    reload = true;
                    localStorage.removeItem(key);
                } else if(isDiff(data, localStorage.getItem(key))){
                    reload = true;
                    localStorage.setItem(key, data);
                }
            });
            if(reload){
                location.reload();
            }
        } else {
            console.info('no user found');
        }
    }

    function onLoad(){
        const prevAppUserState = JSON.parse(localStorage.getItem(CLIENT_APP_KEY.APP_USER_STATE)) as IAppUserState;

        if(prevAppUserState){
            localStorage.removeItem(CLIENT_APP_KEY.APP_USER_STATE);
            window.scrollTo(prevAppUserState.scrollX, prevAppUserState.scrollY)
        }
    }

    function handleInitResponse(user: IClientUser | undefined) {
        onLoad();
        if(user){
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
        } else {
            console.info('no user found');
        }
    }

    function handleChangeUser(user: IClientUser){
        console.log("handleChangeUser", user.storageKeysWithData)
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
    window.setInterval(updateData, 5000);
}());
