import { browser } from "webextension-polyfill-ts";
import storage from '../utils/storage';
    import {IApp, IClientUser, IServerUser, IStorageKeyWithData, MESSAGE_TYPE, SUPPORTED_CLIENT} from "../typings/index";
import {getCurrentUserData} from "./utils/get-current-data";

const VERSION = '1.0.0';
//Sentry.INIT_APP({ dsn: 'https://dd2362f7d005446585e6414b1662594e@sentry.io/1407701' });
//Sentry.configureScope((scope) => {
//    scope.setTag("version", VERSION);
//});


function isDiff(obj1: any, obj2: any){
    return JSON.stringify(obj1) !== JSON.stringify(obj2)
}

async function setData(client: SUPPORTED_CLIENT, clientUserId: string, data: any): Promise<IServerUser> {
    console.log("setData", client, clientUserId, data);
    const serverUserSetOnClient = await storage.getUser(clientUserId);
    if(serverUserSetOnClient){
        console.log('serverUserSetOnClient',serverUserSetOnClient)
        const clientDataFromServer = serverUserSetOnClient.clientsData[client];

        if(isDiff(clientDataFromServer, data)){
            return storage.setUserData(serverUserSetOnClient.id, data, client);
        }
        return storage.getUser(clientUserId);
    }
    const users = await storage.getUsers();
    return users[0];
}

async function setUserData(client: SUPPORTED_CLIENT, id: string, storageKeysWithData: IStorageKeyWithData[]): Promise<IClientUser> {
    console.log('setUserData', client, id, storageKeysWithData)
    const currentUser = await setData(client, id, storageKeysWithData)
            .then((user:IServerUser) => storage.getUser(user.id));

    console.log('setUserData', currentUser)
    return Promise.resolve(serverUserToClient(currentUser, client))
}

function serverUserToClient(user: IServerUser, client: SUPPORTED_CLIENT):IClientUser{
    return {
        ...user,
        storageKeysWithData: user.clientsData[client]?.storageKeysWithData || [],
        clients: Object.keys(user.clientsData) as SUPPORTED_CLIENT[]
    }
}

async function handleInitApp(client: SUPPORTED_CLIENT, clientUserData: IStorageKeyWithData[], clientUserId?:string):Promise<IClientUser>{
    const currentUser = await getCurrentUserData(client, clientUserData, clientUserId);
    console.log("handleInitApp", currentUser);
    const currentUserForServer = serverUserToClient(currentUser, client);

    console.log("currentUserForServer", currentUserForServer)

    return Promise.resolve(currentUserForServer)
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
    console.log('onError', error);
}

async function handleMessage({type, clientId, storageKeysWithData, userId, user}: {
    type: MESSAGE_TYPE,
    clientId: SUPPORTED_CLIENT,
    storageKeysWithData: IStorageKeyWithData[],
    userId?: string,
    user?: IClientUser
}): Promise<IClientUser> {
    console.log('handleMessage', type, storageKeysWithData, userId, user, clientId);
    switch (type) {
        case MESSAGE_TYPE.INIT_APP:
            return handleInitApp(clientId, storageKeysWithData, userId);
        case MESSAGE_TYPE.REQUEST_INITIAL_STATE:
            console.log('req current')
            sendMessageToContent(MESSAGE_TYPE.CURRENT_USER, clientId)
            break;
        case MESSAGE_TYPE.ADD_DATA_FOR_USER:
            return setUserData(clientId, userId, storageKeysWithData)
        case MESSAGE_TYPE.CURRENT_USER_FORM_UI:
            console.log("CURRENT_USER_FORM_UI", userId)
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
