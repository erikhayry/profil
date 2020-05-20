import {CLIENT_APP_KEY, IClientUser, IStorageKeyWithData, MESSAGE_TYPE} from "../typings/index";
import { browser } from "webextension-polyfill-ts";
import Messenger from "../utils/messenger";
import {getSearchFromUrl, isDiff} from "../utils/data-handler";
import {IBackgroundResponse} from "./background";
import storage from "../utils/storage";
import {removeURLParameters} from "../utils/url";
import sentry from "../utils/sentry";
sentry.run();

interface IAppUserState {
    scrollY: number,
    scrollX: number
}

(function() {
    function updateData(){
        Messenger.client.addDataForUser(location.host)
            .catch(handleError);
    }

    function handlePrevClientState(){
        const prevAppUserState = JSON.parse(localStorage.getItem(CLIENT_APP_KEY.APP_USER_STATE)) as IAppUserState;

        if(prevAppUserState){
            localStorage.removeItem(CLIENT_APP_KEY.APP_USER_STATE);
            window.scrollTo(prevAppUserState.scrollX, prevAppUserState.scrollY)
        }
    }

    function updateLocalStorage({key, data: serverUserData}: IStorageKeyWithData, ignoredKeysDiffCompare: string[] = []): boolean {
        const clientUserData =  localStorage.getItem(key);
        if(!serverUserData || !clientUserData){
            return false
        }

        //has new => update local storage
        if(!ignoredKeysDiffCompare.includes(key) && isDiff(serverUserData, clientUserData)) {
            localStorage.setItem(key, serverUserData);
            return true;
        }
        return  false
    }

    async function handleInitResponse({currentUser, profileSelectorUrl}: IBackgroundResponse) {
        handlePrevClientState();

        if(currentUser){
            const { id: serverUserId, ignoredKeysDiffCompare, storageKeysWithData } = currentUser;
            Messenger.client.currentUser(location.host);

            //Update current user in local storage
            if(localStorage.getItem(CLIENT_APP_KEY.APP_USER_KEY) !== serverUserId){
                localStorage.setItem(CLIENT_APP_KEY.APP_USER_KEY, serverUserId);
            }
            let shouldReload = false;
            //Update local storage with user data from server
            storageKeysWithData.forEach(storageKeyWithData => {
                if(updateLocalStorage(storageKeyWithData, ignoredKeysDiffCompare)){
                    shouldReload = true;
                }
            });
            if(shouldReload){
                console.info('RELOAD: new data', storageKeysWithData);
                location.reload();
            }

        } else {
            const users = await storage.getUsers();
            console.info('no user found', users);
            if(users.length > 0){
                window.location.href = `${profileSelectorUrl}?href=${encodeURIComponent(window.location.href)}`;
            }
        }
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

        console.info('RELOAD: new user', user);
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
    const { profileCurrentUser } =  getSearchFromUrl(window.location.search);
    if(profileCurrentUser){
        removeURLParameters(['profileCurrentUser']);
        localStorage.setItem(CLIENT_APP_KEY.APP_USER_KEY, profileCurrentUser);
    }

    Messenger.client.initAppReq(location.host)
        .then(handleInitResponse, handleError);
    window.setInterval(updateData, 5000);
}());
