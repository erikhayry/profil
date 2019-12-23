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

async function getCurrentUserData({user, data}: {user?: string, data?: any}) {
    const serverUserSetOnClient = await storage.getUser(user);
    console.log("serverUserSetOnClient", serverUserSetOnClient, user)
    if(serverUserSetOnClient){
        //TODO compare data date?
        return storage.setCurrentUser(serverUserSetOnClient.id)
                .then(({currentUser}) => storage.getUser(currentUser))
    }

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
