// @ts-ignore
const browser = require("webextension-polyfill");
import storage, {IData, IUser} from '../utils/storage';

export enum MESSAGE_TYPE {
    INIT = 'init',
    DATA = 'data',
    CURRENT_USER = 'currentUser',
    SYNC_USER = 'syncUser'
}

const VERSION = '1.0.0';
//Sentry.INIT({ dsn: 'https://dd2362f7d005446585e6414b1662594e@sentry.io/1407701' });
//Sentry.configureScope((scope) => {
//    scope.setTag("version", VERSION);
//});

function setData(userId: string, data: any): Promise<IData> {
    return storage.setUserData(userId, data)
}

function setUserData(data: any): Promise<IUser> {
    return storage.getCurrentUser()
            .then(({ id }: IUser) => {
                return setData(id, data)
                    .then(() => storage.getUser(id))

            })
}

async function getCurrentUserData({id: hostUserId, data: hostUserData}: {id?: string, data?: any}): Promise<IUser> {
    console.log('getCurrentUserData', hostUserId, hostUserData);

    //1.
    //Host: no data, no user.
    //Server: no data
    if(!hostUserId && !hostUserData){
        console.log('1')
        return storage.getCurrentUser();
    }

    //2.
    //Host: data, no user
    //Server no data
    if(!hostUserId && hostUserData){
        console.log('2')
        const newUser = await storage.addUser(hostUserData);
        return storage.setCurrentUser(newUser.id);
    }

    if(hostUserId && !hostUserData){
        const serverUserSetOnClient = await storage.getUser(hostUserId);

        //3.
        //Host: no data, valid user
        //Server: no data
        if(serverUserSetOnClient){
            console.log('3')
            return storage.setCurrentUser(serverUserSetOnClient.id);
        }

        //5.
        //Host: no data. Invalid user
        //Server: no data
        console.log('5')
        return storage.getCurrentUser();
    }


    if(hostUserId && hostUserData){
        const serverUserSetOnClient = await storage.getUser(hostUserId);

        //4.
        //Host: data, valid user
        //Server: no data
        if(serverUserSetOnClient){
            console.log('4')
            return storage.setCurrentUser(serverUserSetOnClient.id);
        }

        //6.
        //Host: data. Invalid user
        //Server: no data
        console.log('6')
        const newUser = await storage.addUser(hostUserData);
        return storage.setCurrentUser(newUser.id);
    }

    const serverUserSetOnClient = await storage.getUser(hostUserId);
    console.log("serverUserSetOnClient", serverUserSetOnClient, hostUserId)



    //if(serverUserSetOnClient){
    //    //TODO compare data date?
    //    return storage.setCurrentUser(serverUserSetOnClient.id)
    //            .then(({currentUser}) => storage.getUser(currentUser))
    //}
//
    return storage.getData()
        .then(({currentUser, users}) => {
            return users.find(( { id } ) => id === currentUser);
        });
}

function getUserData(userId: string) {
    return storage.getUser(userId);
}

function sendMessage(type: MESSAGE_TYPE, user: IUser){
    browser.tabs.query({
        currentWindow: true,
        active: true
    }).then((tabs: {id: string}[]) => {
        sendMessageToTabs(tabs, type, user)
    }).catch(onError);
}

function sendMessageToTabs(tabs: {id: string}[], type: MESSAGE_TYPE, user: IUser) {
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

async function handleMessage({type, data}: {type: MESSAGE_TYPE, data: any} ): Promise<IUser> {

    switch (type) {
        case MESSAGE_TYPE.INIT:
            return getCurrentUserData(data);
        case MESSAGE_TYPE.DATA:
            return setUserData(data)
        case MESSAGE_TYPE.CURRENT_USER:
            sendMessage(MESSAGE_TYPE.CURRENT_USER, data)
            break;
        case MESSAGE_TYPE.SYNC_USER:
            const user = await storage.getUser(data);
            browser.runtime.sendMessage({type, user})
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
