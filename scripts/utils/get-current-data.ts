import {IServerUser, SUPPORTED_CLIENT} from "../../typings/index";
import storage from "../../utils/storage";

export async function getCurrentUser(client: SUPPORTED_CLIENT, clientUserId?:string): Promise<IServerUser | undefined> {
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
