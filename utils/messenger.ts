import {browser, Tabs} from "webextension-polyfill-ts";
import {CLIENT_APP_KEY, IClientUser, MESSAGE_TYPE, SUPPORTED_CLIENT} from "../typings/index";
import {getClient} from "./client-handler";
import Tab = Tabs.Tab;
import {IBackgroundResponse} from "../scripts/background";

function getMessageBody(origin: string){
    const client = getClient(origin);
    const storageKeysWithData = client.dataKeys.map(dataKey => {
        return {
            key: dataKey,
            data: localStorage.getItem(dataKey)
        }
    });
    const userId = localStorage.getItem(CLIENT_APP_KEY.APP_USER_KEY)
    return {
        clientId: client.id,
        userId,
        storageKeysWithData
    }
}

function initAppReq(origin: string):Promise<IBackgroundResponse>{
    const messageBody = getMessageBody(origin);
    return browser.runtime.sendMessage({
        type: MESSAGE_TYPE.INIT_APP,
        clientId: messageBody.clientId,
        userId: messageBody.userId
    })
}

function initialStateRes(origin: string): void {
    const messageBody = getMessageBody(origin);
    browser.runtime.sendMessage({
        type: MESSAGE_TYPE.INITIAL_STATE_RESPONSE,
        clientId: messageBody.clientId,
        userId: messageBody.userId
    });
}

function currentUser(origin: string): void {
    const messageBody = getMessageBody(origin);
    browser.runtime.sendMessage({
        type: MESSAGE_TYPE.CURRENT_USER,
        clientId: messageBody.clientId,
        userId: messageBody.userId
    });
}

function addDataForUser(origin: string): Promise<IBackgroundResponse>{
    const messageBody = getMessageBody(origin);
    return browser.runtime.sendMessage({
        type: MESSAGE_TYPE.ADD_DATA_FOR_USER,
        ...messageBody
    })
}

async function sendMessageToContent(type: MESSAGE_TYPE, client: SUPPORTED_CLIENT, user?: IClientUser): Promise<boolean>{
    try {
        const tabs = await browser.tabs.query({
            currentWindow: true,
            active: true
        });

        const messages = tabs.map((tab) => {
            return sendMessageToTab(tab, type, user);
        });

        return Promise.all(messages).then(() => true);
    } catch(error){
        return Promise.reject(error)
    }
}

function sendMessageToTab(tab:Tab, type: MESSAGE_TYPE, user?: IClientUser): Promise<any> {
        return browser.tabs.sendMessage(
            tab.id,
            {type, user}
        )
}

export default {
    background: {
        sendMessageToContent
    },
    client: {
        initAppReq,
        initialStateRes,
        currentUser,
        addDataForUser
    }
}
