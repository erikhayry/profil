import {IClientUser, IServerUser, SUPPORTED_CLIENT} from "../typings/index";
import {CLIENT_ORIGINS} from "./client-handler";

export function isDiff(obj1: any, obj2: any): Boolean{
    if(!Boolean(obj1) && !Boolean(obj2)){
        return false
    }
    return JSON.stringify(obj1) !== JSON.stringify(obj2)
}

export function serverUserToClient(user: IServerUser, client: SUPPORTED_CLIENT):IClientUser{
    const clientDataKeys = CLIENT_ORIGINS.find(({id}) => id === client)?.dataKeys || [];
    const storageKeysWithData = clientDataKeys.map(key => {
        const data = user.clientsData[client]?.find(({ key:dataKey }) => key === dataKey)?.data;
        return {
            key,
            data
        }
    });
    return {
        ...user,
        storageKeysWithData,
        clients: Object.keys(user.clientsData || {}) as SUPPORTED_CLIENT[]
    }
}
