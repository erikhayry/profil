//import * as Sentry from "Sentry";
//
//const VERSION = '1.0.0';
//Sentry.init({ dsn: 'https://25806d610e264b83a4a363f1bca8cfe3@sentry.io/1873455' });
//Sentry.configureScope((scope: any) => {
//    scope.setTag("version", VERSION);
//});

import {CLIENT_APP_KEY, IClientUser, MESSAGE_TYPE} from "../typings/index";
import { browser } from "webextension-polyfill-ts";
import Messenger from "../utils/messenger";
import {getSearchFromUrl, isDiff} from "../utils/data-handler";
import {IBackgroundResponse} from "./background";
import storage from "../utils/storage";
import {removeURLParameters} from "../utils/url";

interface IAppUserState {
    scrollY: number,
    scrollX: number
}

(function() {
    function updateData(){
        Messenger.client.addDataForUser(location.host)
            .then(handleSetDataResponse, handleError);
    }

    function handleSetDataResponse({currentUser, profileSelectorUrl}: IBackgroundResponse) {
        if(currentUser){
            let reload = false;
            const { id: serverUserId, storageKeysWithData = [] } = currentUser;
            localStorage.setItem(CLIENT_APP_KEY.APP_USER_KEY, serverUserId);

            storageKeysWithData.forEach(({key, data} ) => {
                if(isDiff(data, localStorage.getItem(key))){
                    reload = true;
                    localStorage.setItem(key, data);
                }
            });
            if(reload){
                location.reload();
            }
        } else {
            console.info('no user found');
            //window.location.href = `${profileSelectorUrl}?href=${window.location.href}`;
        }
    }

    function onLoad(){
        const prevAppUserState = JSON.parse(localStorage.getItem(CLIENT_APP_KEY.APP_USER_STATE)) as IAppUserState;

        if(prevAppUserState){
            localStorage.removeItem(CLIENT_APP_KEY.APP_USER_STATE);
            window.scrollTo(prevAppUserState.scrollX, prevAppUserState.scrollY)
        }
    }

    async function handleInitResponse({currentUser, profileSelectorUrl}: IBackgroundResponse) {
        onLoad();
        if(currentUser){
            const { id: serverUserId } = currentUser;
            Messenger.client.currentUser(location.host);

            if(localStorage.getItem(CLIENT_APP_KEY.APP_USER_KEY) !== serverUserId){
                localStorage.setItem(CLIENT_APP_KEY.APP_USER_KEY, serverUserId);
            }

            currentUser.storageKeysWithData.forEach(( {key, data} ) => {
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
            const users = await storage.getUsers();
            console.info('init: no user found', users);
            if(users.length > 0){
                window.location.href = `${profileSelectorUrl}?href=${window.location.href}`;
            }
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
    const { profileCurrentUser } =  getSearchFromUrl(window.location);
    if(profileCurrentUser){
        removeURLParameters(['profileCurrentUser']);
        localStorage.setItem(CLIENT_APP_KEY.APP_USER_KEY, profileCurrentUser);
    }

    Messenger.client.initAppReq(location.host)
        .then(handleInitResponse, handleError);
    window.setInterval(updateData, 5000);
}());
