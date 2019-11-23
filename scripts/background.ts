// @ts-ignore
const browser = require("webextension-polyfill");
import storage, {IData, IUser} from '../utils/storage';

export enum MESSAGE_TYPE {
    INIT = 'init',
    DATA = 'data',
    CURRENT_USER = 'currentUser'
}

const VERSION = '1.0.0';
//Sentry.INIT({ dsn: 'https://dd2362f7d005446585e6414b1662594e@sentry.io/1407701' });
//Sentry.configureScope((scope) => {
//    scope.setTag("version", VERSION);
//});

function setData(userId: string, data: any): Promise<IData> {
    console.log("setData", userId, data);
    return storage.setUserData(userId, data)
}

function setUserData(data: any): Promise<IUser> {
    console.log("setUserData", data)
    return storage.getCurrentUser()
            .then(({ id }: IUser) => {
                return setData(id, data)
                    .then(() => storage.getUser(id))

            })
}

function getUserData() {
    console.log("getUserData");
    return storage.getData()
        .then(({currentUser, users}) => {
            if(currentUser){
                return users.find(( { id } ) => id === currentUser)
            }

            return undefined;
        });
}

function handleMessage({type, data}: {type: MESSAGE_TYPE, data: any} ): Promise<IUser> {
    console.log("handleMessage", type, data);

    switch (type) {
        case MESSAGE_TYPE.INIT:
            return getUserData();
        case MESSAGE_TYPE.DATA:
            return setUserData(data)
        case MESSAGE_TYPE.CURRENT_USER:
            return storage.getCurrentUser()
    }
}

function handleBrowserAction(){
    browser.runtime.openOptionsPage();
}

if(browser.browserAction){
    //browser.browserAction.onClicked.addListener(handleBrowserAction);
}
browser.runtime.onMessage.addListener(handleMessage);