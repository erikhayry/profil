// @ts-ignore
const browser = require("webextension-polyfill");
import storage from '../utils/storage';
    import {IApp, IUser, MESSAGE_TYPE} from "../typings/index";

const VERSION = '1.0.0';
//Sentry.INIT_APP({ dsn: 'https://dd2362f7d005446585e6414b1662594e@sentry.io/1407701' });
//Sentry.configureScope((scope) => {
//    scope.setTag("version", VERSION);
//});


function isDiff(obj1: any, obj2: any){
    return JSON.stringify(obj1) !== JSON.stringify(obj2)
}

async function setData(hostUserId: string, data: any): Promise<IUser> {
    console.log("setData", hostUserId, data)
    const serverUserSetOnClient = await storage.getUser(hostUserId);
    if(serverUserSetOnClient){
        if(isDiff(serverUserSetOnClient.data, data)){
            await storage.setUserData(serverUserSetOnClient.id, data);
        }
        return serverUserSetOnClient;
    }
    const { users } = await storage.getData();
    return users[0];
}

function setUserData(id: string, data: string): Promise<IUser> {
    return setData(id, data)
            .then((user:IUser) => storage.getUser(user.id))
}

async function getCurrentUserData(hostUserId?:string, hostUserData?:string): Promise<IUser> {
    console.log('getCurrentUserData', hostUserId, hostUserData);

    if(!hostUserId && !hostUserData){
        const { users } = await storage.getData();
        //1.
        //Host: no data, no user.
        //Server: no data
        if(users.every(user => !user.data)){
            console.log('1');
            return Promise.resolve(users[0]);
        }

        //7.
        //Host: no data, no user.
        //Server: data
        console.log('7');
        return Promise.resolve(users[0])

        //return storage.addUser();
    }

    if(!hostUserId && hostUserData){
        const { users } = await storage.getData();
        const unusedUser = users.find(user => !user.data);
        //2.
        //Host: data, no user
        //Server no data
        //8.
        //Host: data, no user
        //Server: data
        if(unusedUser){
            console.log('2');
            console.log('8.1');
            return storage.setUserData(unusedUser.id, hostUserData);
        }
        console.log('8.2');
        return storage.addUser(hostUserData);

    }

    if(hostUserId && !hostUserData){
        const serverUserSetOnClient = await storage.getUser(hostUserId);

        //3.
        //Host: no data, valid user
        //Server: no data
        //9.
        //Host: no data, valid user
        //Server: data
        if(serverUserSetOnClient){
            console.log('3,9');
            return Promise.resolve(serverUserSetOnClient);
        }

        //5.
        //Host: no data. Invalid user
        //Server: no data
        const { users } = await storage.getData();
        if(users.every(user => !user.data)){
            console.log('5');
            return Promise.resolve(users[0]);
        }
        //11.
        //Host: no data. Invalid user
        //Server: data
        console.log('11');
        return Promise.resolve(users[0])
    }

    if(hostUserId && hostUserData){
        const serverUserSetOnClient = await storage.getUser(hostUserId);

        //4.
        //Host: data, valid user
        //Server: no data
        if(serverUserSetOnClient && !serverUserSetOnClient.data && hostUserData){
            console.log('4')
            return storage.setUserData(serverUserSetOnClient.id, hostUserData);
        }
        if(serverUserSetOnClient && serverUserSetOnClient.data){
            //10.
            //Host: data, valid user
            //Server: data
            console.log('10')
            return Promise.resolve(serverUserSetOnClient);
        }

        if(!serverUserSetOnClient){
            const { users } = await storage.getData();

            //6
            //Host: data. Invalid user
            //Server: no data
            //12.
            //Host: data. Invalid user
            //Server: data
            console.log('6, 12');
            return Promise.resolve(users[0]);
        }
    }
}

async function sendMessageToContent(type: MESSAGE_TYPE, userId?: string){
    console.log('sendMessageToContent', userId);
    const currentUser = await storage.getUser(userId);
    browser.tabs.query({
        currentWindow: true,
        active: true
    }).then((tabs: {id: string}[]) => {
        sendMessageToTabs(tabs, type, currentUser)
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
    console.log('onError', error);
}

async function handleMessage({type, data, userId, user}: {
    type: MESSAGE_TYPE,
    data?: any,
    userId?: string,
    user?: IUser
}): Promise<IUser> {
    console.log('handleMessage', type, data, userId, user);
    switch (type) {
        case MESSAGE_TYPE.INIT_APP:
            return getCurrentUserData(userId, data);
        case MESSAGE_TYPE.REQUEST_CURRENT_USER:
            console.log('req current')
            sendMessageToContent(MESSAGE_TYPE.CURRENT_USER)
            break;
        case MESSAGE_TYPE.ADD_DATA_FOR_USER:
            return setUserData(userId, data)
        case MESSAGE_TYPE.CURRENT_USER_FORM_UI:
            console.log("CURRENT_USER_FORM_UI", userId)
            sendMessageToContent(MESSAGE_TYPE.CURRENT_USER_FROM_BACKGROUND, userId);
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
