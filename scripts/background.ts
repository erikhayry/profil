import { browser } from "webextension-polyfill-ts";
import storage from '../utils/storage';
import {IClientUser, IServerUser, IStorageKeyWithData, MESSAGE_TYPE, SUPPORTED_CLIENT} from "../typings/index";
import {getCurrentUser} from "./utils/get-current-data";
import {isDiff, serverUserToClient} from "../utils/data-handler";
import messenger from "../utils/messenger";
import {getImageFromAvatar} from "./utils/image-utils";
import sizeof from "object-sizeof";
import sentry from "../utils/sentry";
import {init} from "../utils/ga";
const ga = init();
sentry.run();

const profileSelectorPageUrl = browser.runtime.getURL('/ui/src/pages/selector/selector.html');

export interface IBackgroundResponse {
    currentUser?: IClientUser,
    profileSelectorUrl: string
}

async function setData(client: SUPPORTED_CLIENT, clientUserId: string, data: any): Promise<IServerUser | undefined> {
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
            profileSelectorUrl: profileSelectorPageUrl
        })
    }

    return Promise.resolve({
        profileSelectorUrl: profileSelectorPageUrl
    });
}

async function handleInitApp(client: SUPPORTED_CLIENT, clientUserId?:string):Promise<IBackgroundResponse>{
    const currentUser = await getCurrentUser(client, clientUserId);
    if(currentUser){
        ga('send', 'event', 'Storage', 'total', sizeof(currentUser.clientsData));
    }
    return Promise.resolve({
        currentUser: currentUser ? serverUserToClient(currentUser, client) : undefined,
        profileSelectorUrl: profileSelectorPageUrl
    })
}

async function handleCurrentUserRequest(clientId: SUPPORTED_CLIENT, userId: string){
    const currentUser = await storage.getUser(userId);
    return serverUserToClient(currentUser, clientId);
}

async function notify(userId: string, clientId: string){
    const notificationId = `${userId}-${clientId}`;
    const notifications = await browser.notifications.getAll();
    const notificationsIds = Object.keys(notifications);

    if (notificationsIds.indexOf(notificationId) === -1) {
        const user = await storage.getUser(userId);
        const image = await getImageFromAvatar(user.avatar);
        browser.notifications.create(notificationId, {
            "type": "basic",
            "iconUrl": image,
            "title": 'Profil',
            "message": `Inloggad på ${clientId} som ${user.name}`,
        });
    }
}

async function handleMessage({type, clientId, storageKeysWithData, userId, user}: {
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
        case MESSAGE_TYPE.CURRENT_USER:
            notify(userId, clientId);
            break;
        default:
    }
}

browser.runtime.onMessage.addListener(handleMessage);
