import { browser } from "webextension-polyfill-ts";
import storage from '../utils/storage';
    import {IApp, IClientUser, IServerUser, IStorageKeyWithData, MESSAGE_TYPE, SUPPORTED_CLIENT} from "../typings/index";
import {getCurrentUser} from "./utils/get-current-data";
import {serverUserToClient} from "../utils/data-handler";

const VERSION = '1.0.0';
//Sentry.INIT_APP({ dsn: 'https://dd2362f7d005446585e6414b1662594e@sentry.io/1407701' });
//Sentry.configureScope((scope) => {
//    scope.setTag("version", VERSION);
//});


function isDiff(obj1: any, obj2: any){
    return JSON.stringify(obj1) !== JSON.stringify(obj2)
}

async function setData(client: SUPPORTED_CLIENT, clientUserId: string, data: any): Promise<IServerUser> {
    const serverUserSetOnClient = await storage.getUser(clientUserId);
    if(serverUserSetOnClient){
        const clientDataFromServer = serverUserSetOnClient.clientsData ? serverUserSetOnClient.clientsData[client] : undefined;

        if(isDiff(clientDataFromServer, data)){
            return storage.setUserData(serverUserSetOnClient.id, data, client);
        }
        return storage.getUser(clientUserId);
    }

    return undefined;
}

async function setUserData(client: SUPPORTED_CLIENT, clientUserId: string, storageKeysWithData: IStorageKeyWithData[]): Promise<IClientUser | undefined> {
    let currentUser = await getCurrentUser(client, clientUserId);

    if(currentUser){
        currentUser = await setData(client, clientUserId, storageKeysWithData)
                .then((user:IServerUser) => storage.getUser(user.id));
        return Promise.resolve(serverUserToClient(currentUser, client))
    }

    return Promise.resolve(undefined);

}

async function handleInitApp(client: SUPPORTED_CLIENT, clientUserId?:string):Promise<IClientUser>{
    const currentUser = await getCurrentUser(client, clientUserId);

    return Promise.resolve(currentUser ? serverUserToClient(currentUser, client) : undefined)
}

async function sendMessageToContent(type: MESSAGE_TYPE, client: SUPPORTED_CLIENT, user?: IClientUser){
    browser.tabs.query({
        currentWindow: true,
        active: true
    }).then((tabs) => {
        sendMessageToTabs(tabs, type, user)
    }).catch(onError);
}

function sendMessageToTabs(tabs: {id?: number}[], type: MESSAGE_TYPE, user?: IClientUser) {
    for (let tab of tabs) {
        browser.tabs.sendMessage(
            tab.id,
            {type, user}
        ).then((response: any) => {
        }).catch(onError);
    }
}

function onError(error: string) {
}

async function handleMessage({type, clientId, storageKeysWithData, userId}: {
    type: MESSAGE_TYPE,
    clientId: SUPPORTED_CLIENT,
    storageKeysWithData: IStorageKeyWithData[],
    userId?: string,
    user?: IClientUser
}): Promise<IClientUser> {
    switch (type) {
        case MESSAGE_TYPE.INIT_APP:
            return handleInitApp(clientId, userId);
        case MESSAGE_TYPE.REQUEST_INITIAL_STATE:
            sendMessageToContent(MESSAGE_TYPE.CURRENT_USER, clientId)
            break;
        case MESSAGE_TYPE.ADD_DATA_FOR_USER:
            return setUserData(clientId, userId, storageKeysWithData)
        case MESSAGE_TYPE.CURRENT_USER_FORM_UI:
            const currentUser = await storage.getUser(userId);
            const currentUserForClient = await serverUserToClient(currentUser, clientId);
            sendMessageToContent(MESSAGE_TYPE.CURRENT_USER_FROM_BACKGROUND, clientId, currentUserForClient);
            break;
        default:
    }
}

function handleBrowserAction(){
    browser.runtime.openOptionsPage();
}

if(browser.browserAction){
    //browser.browserAction.onClicked.addListener(handleBrowserAction);
}
browser.runtime.onMessage.addListener(handleMessage);
