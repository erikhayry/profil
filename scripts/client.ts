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

const HAS_RELOADED_KEY = 'profil-reloaded';

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

    function updateLocalStorage({key, data}: IStorageKeyWithData, ignoredKeysDiffCompare: string[] = []){
        const clientUserData =  localStorage.getItem(key);

        //if stored date and no current data or is not ignored key or is new date => update local storage
        if(data && (!clientUserData || ignoredKeysDiffCompare.includes(key) || isDiff(data, clientUserData))) {
            localStorage.setItem(key, data);
            //Check if host has been reloaded for current user
            const haveReloaded = Number.parseInt(localStorage.getItem(HAS_RELOADED_KEY)) || 0;
            if(!haveReloaded){
                localStorage.setItem(HAS_RELOADED_KEY, '1');
                location.reload();
            }
        }
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

            //Update local storage with user data from server
            storageKeysWithData.forEach(storageKeyWithData => updateLocalStorage(storageKeyWithData, ignoredKeysDiffCompare));
        } else {
            const users = await storage.getUsers();
            console.info('no user found', users);
            if(users.length > 0){
                window.location.href = `${profileSelectorUrl}?href=${encodeURIComponent(window.location.href)}`;
            }
        }
        localStorage.setItem(HAS_RELOADED_KEY, '0');
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
