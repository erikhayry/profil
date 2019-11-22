import {getData, getCurrentUser} from './utils/index.js';

const VERSION = '1.0.0';
//Sentry.init({ dsn: 'https://dd2362f7d005446585e6414b1662594e@sentry.io/1407701' });
//Sentry.configureScope((scope) => {
//    scope.setTag("version", VERSION);
//});
console.log("background")

function setData(user, data){
    console.log("setData", user, data);
    return browser.storage.sync.set({
        [`${user}_profile_data`]: data
    });
}

function setUserData(data) {
    console.log("setUserData", data)
    //return getUser()
        //.then(({ user }) => setData(user, data))
}

function getUserData() {
    console.log("getUserData");
    return getData()
        .then(({currentUser, users}) => {
            if(currentUser){
                return users.find(( { id } ) => id === currentUser)
            }

            return undefined;
        });
}

function handleMessage({type, data} ) {
    console.log("handleMessage", type, data);

    switch (type) {
        case 'init':
            return getUserData();
        case 'data':
            return setUserData(data)
    }
}

function handleBrowserAction(){
    browser.runtime.openOptionsPage();
}

browser.browserAction.onClicked.addListener(handleBrowserAction);
browser.runtime.onMessage.addListener(handleMessage);