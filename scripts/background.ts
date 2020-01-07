import { browser } from "webextension-polyfill-ts";
import storage from '../utils/storage';
import {IClientUser, IServerUser, IStorageKeyWithData, MESSAGE_TYPE, SUPPORTED_CLIENT} from "../typings/index";
import {getCurrentUser} from "./utils/get-current-data";
import {isDiff, serverUserToClient} from "../utils/data-handler";
import messenger from "../utils/messenger";

const profileSelectorUrl = browser.runtime.getURL('/ui/selector.html');

export interface IBackgroundResponse {
    currentUser?: IClientUser,
    profileSelectorUrl: string
}

async function setData(client: SUPPORTED_CLIENT, clientUserId: string, data: any): Promise<IServerUser> {
    const serverUserSetOnClient = await storage.getUser(clientUserId);
    if(serverUserSetOnClient){
        const clientDataFromServer = serverUserSetOnClient.clientsData ? serverUserSetOnClient.clientsData[client] : undefined;

        if(isDiff(clientDataFromServer, data)){
            return storage.setUserData(serverUserSetOnClient.id, data, client);
        }
        return storage.getUser(clientUserId);
    }

    return undefined;
}

async function setUserData(client: SUPPORTED_CLIENT, clientUserId: string, storageKeysWithData: IStorageKeyWithData[]): Promise<IBackgroundResponse> {
    let currentUser = await getCurrentUser(client, clientUserId);

    if(currentUser){
        currentUser = await setData(client, clientUserId, storageKeysWithData)
                .then((user:IServerUser) => storage.getUser(user.id));
        return Promise.resolve({
            currentUser: serverUserToClient(currentUser, client),
            profileSelectorUrl
        })
    }

    return Promise.resolve(undefined);
}

async function handleInitApp(client: SUPPORTED_CLIENT, clientUserId?:string):Promise<IBackgroundResponse>{
    const currentUser = await getCurrentUser(client, clientUserId);
    return Promise.resolve({
        currentUser: serverUserToClient(currentUser, client),
        profileSelectorUrl
    })
}

async function handleCurrentUserRequest(clientId: SUPPORTED_CLIENT, userId: string){
    const currentUser = await storage.getUser(userId);
    return serverUserToClient(currentUser, clientId);
}

async function handleMessage({type, clientId, storageKeysWithData, userId}: {
    type: MESSAGE_TYPE,
    clientId: SUPPORTED_CLIENT,
    storageKeysWithData: IStorageKeyWithData[],
    userId?: string,
    user?: IClientUser
}): Promise<IBackgroundResponse> {
    switch (type) {
        case MESSAGE_TYPE.INIT_APP:
            return handleInitApp(clientId, userId);
        case MESSAGE_TYPE.REQUEST_INITIAL_STATE:
            messenger.background.sendMessageToContent(MESSAGE_TYPE.CURRENT_USER, clientId);
            break;
        case MESSAGE_TYPE.ADD_DATA_FOR_USER:
            return setUserData(clientId, userId, storageKeysWithData);
        case MESSAGE_TYPE.CURRENT_USER_FORM_UI:
            const currentUser = await handleCurrentUserRequest(clientId, userId);
            messenger.background.sendMessageToContent(MESSAGE_TYPE.CURRENT_USER_FROM_BACKGROUND, clientId, currentUser);
            break;
        default:
    }
}

browser.runtime.onMessage.addListener(handleMessage);
