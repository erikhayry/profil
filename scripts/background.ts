import { browser } from "webextension-polyfill-ts";
import storage from '../utils/storage';
    import {IApp, IClientUser, IServerUser, IStorageKeyWithData, MESSAGE_TYPE, SUPPORTED_CLIENT} from "../typings/index";

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
        const clientDataFromServer = serverUserSetOnClient.clientsData[client];

        if(isDiff(clientDataFromServer, data)){
            await storage.setUserData(serverUserSetOnClient.id, data, client);
        }
        return serverUserSetOnClient;
    }
    const { users } = await storage.getData();
    return users[0];
}

async function setUserData(client: SUPPORTED_CLIENT, id: string, storageKeysWithData: IStorageKeyWithData[]): Promise<IClientUser> {
    const currentUser = await setData(client, id, storageKeysWithData)
            .then((user:IServerUser) => storage.getUser(user.id));

    return Promise.resolve(serverUserToClient(currentUser, client))
}

function serverUserToClient(user: IServerUser, client: SUPPORTED_CLIENT):IClientUser{
    return {
        ...user,
        storageKeysWithData: user.clientsData[client].storageKeysWithData,
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

async function getCurrentUserData(client: SUPPORTED_CLIENT, clientStorageKeysWithData: IStorageKeyWithData[], clientUserId?:string): Promise<IServerUser> {
    console.log('getCurrentUserData', clientUserId, clientStorageKeysWithData);
    const { users } = await storage.getData();
    console.log("users", users)
    const firstUser = users[0];
    const clientUserDataExists = clientStorageKeysWithData.some(({data}) => data);


    const serverUserDataExists = users.some(user => user.clientsData[client]?.storageKeysWithData.some(({ data }) => data));
    const unusedUser = users.find(user => user.clientsData[client]?.storageKeysWithData.every(({ data }) => !data));

    if(!clientUserId && !clientUserDataExists){
        //1.
        //Client: no data, no user.
        //Server: no data
        if(!serverUserDataExists){
            console.log('1');
            return Promise.resolve(firstUser);
        }

        //7.
        //Client: no data, no user.
        //Server: data
        console.log('7');
        return Promise.resolve(firstUser)

        //return storage.addUser();
    }

    if(!clientUserId && clientUserDataExists){
        //2.
        //Client: data, no user
        //Server no data
        //8.
        //Client: data, no user
        //Server: data
        if(unusedUser){
            console.log('2');
            console.log('8.1');
            return storage.setUserData(unusedUser.id, clientStorageKeysWithData, client);
        }
        console.log('8.2');
        return storage.addUser(clientStorageKeysWithData);

    }

    if(clientUserId && !clientUserDataExists){
        const serverUserSetOnClient = await storage.getUser(clientUserId);

        //3.
        //Client: no data, valid user
        //Server: no data
        //9.
        //Client: no data, valid user
        //Server: data
        if(serverUserSetOnClient){
            console.log('3,9');
            return Promise.resolve(serverUserSetOnClient);
        }

        //5.
        //Client: no data. Invalid user
        //Server: no data
        if(!serverUserDataExists){
            console.log('5');
            return Promise.resolve(firstUser);
        }
        //11.
        //Client: no data. Invalid user
        //Server: data
        console.log('11');
        return Promise.resolve(firstUser)
    }

    if(clientUserId && clientUserDataExists){
        const serverUserSetOnClient = await storage.getUser(clientUserId);

        //4.
        //Client: data, valid user
        //Server: no data
        if(
            serverUserSetOnClient &&
            serverUserSetOnClient.clientsData[client].storageKeysWithData.every(({ data }) => !data) &&
            clientUserDataExists
        ){
            console.log('4')
            return storage.setUserData(serverUserSetOnClient.id, clientStorageKeysWithData, client);
        }
        if(
            serverUserSetOnClient &&
            serverUserSetOnClient.clientsData[client].storageKeysWithData.some(({ data }) => !data)
        ){
            //10.
            //Client: data, valid user
            //Server: data
            console.log('10')
            return Promise.resolve(serverUserSetOnClient);
        }

        if(!serverUserSetOnClient){
            //6
            //Client: data. Invalid user
            //Server: no data
            //12.
            //Client: data. Invalid user
            //Server: data
            console.log('6, 12');
            return Promise.resolve(firstUser);
        }
    }
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
