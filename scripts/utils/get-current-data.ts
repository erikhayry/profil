import {IServerUser, IStorageKeyWithData, SUPPORTED_CLIENT} from "../../typings/index";
import storage from "../../utils/storage";

export async function getCurrentUserData(client: SUPPORTED_CLIENT, clientStorageKeysWithData: IStorageKeyWithData[], clientUserId?:string): Promise<IServerUser | undefined> {
    console.log('getCurrentUserData', clientUserId, clientStorageKeysWithData);
    const users = await storage.getUsers();
    const currentUser = storage.getUser(clientUserId);

    if(!currentUser) {
        if(users.length === 1){
            return Promise.resolve(users[0])
        }
        return undefined;
    }

    return currentUser;
}
