//const VERSION = '1.0.0';
//Sentry.INIT({ dsn: 'https://dd2362f7d005446585e6414b1662594e@sentry.io/1407701' });
//Sentry.configureScope((scope) => {
//    scope.setTag("version", VERSION);
//});

import {MESSAGE_TYPE} from "./background";
import {IUser} from "../utils/storage";

(function() {
    const DATA_KEY = 'persistent_state';
    const browser = require("webextension-polyfill");
    let prevData = {};

    function isDiff(obj1: any, obj2: any){
        return JSON.stringify(obj1) !== JSON.stringify(obj2)
    }

    function updateData(){
        const data = localStorage.getItem(DATA_KEY);
        const type = MESSAGE_TYPE.DATA;

        if(isDiff(prevData, data)){
            console.log('data updated', data)
            prevData = data;
            browser.runtime.sendMessage({type, data})
                .then(handleSetDataResponse, handleError);
        }
    }

    window.setInterval(function () {
        console.log("Check storage")
        updateData();
    }, 5000);

    function handleSetDataResponse({ id, data }: IUser) {
        console.log("on handleSetDataResponse", id, data)
    }

    function handleInitResponse({ id, data }: IUser) {
        console.log("on handleInitResponse", id, data)
        if(data){
            const oldData = localStorage.getItem(DATA_KEY);
            if(isDiff(oldData, data)){
                localStorage.setItem(DATA_KEY, data);
                location.reload();
            }
        } else {
            console.log(' - no data for user');
            localStorage.removeItem(DATA_KEY)
        }
    }

    function handleError(error: string) {
        console.log(`Error: ${error}`);
    }

    browser.runtime.onMessage.addListener( ({ type } : { type: MESSAGE_TYPE}) => {
        console.log("onMessage", type)
        switch (type) {
            case MESSAGE_TYPE.CURRENT_USER:
                location.reload();
                break;
            default:
                console.log('Unknown message type from background', type)
        }
    } );

    browser.runtime.sendMessage({type: MESSAGE_TYPE.INIT})
        .then(handleInitResponse, handleError);

}());

