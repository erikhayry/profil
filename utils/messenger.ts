import { browser } from "webextension-polyfill-ts";
import {CLIENT_APP_KEY, IClientUser, MESSAGE_TYPE} from "../typings/index";
import {getClient} from "./client-handler";

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

function initAppReq(origin: string):Promise<IClientUser>{
    const messageBody = getMessageBody(origin);
    return browser.runtime.sendMessage({
        type: MESSAGE_TYPE.INIT_APP,
        ...messageBody
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

function addDataForUser(origin: string): Promise<IClientUser>{
    const messageBody = getMessageBody(origin);
    return browser.runtime.sendMessage({
        type: MESSAGE_TYPE.ADD_DATA_FOR_USER,
        ...messageBody
    })
}

export default {
    client: {
        initAppReq,
        initialStateRes,
        currentUser,
        addDataForUser
    }
}