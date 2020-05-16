import {IClientUser, IServerUser, SUPPORTED_CLIENT} from "../typings/index";
import {CLIENT_ORIGINS} from "./client-handler";
import _ from 'lodash';

export function isDiff(obj1: any, obj2: any): Boolean{
    return !_.isEqual(obj1, obj2)
}

export function serverUserToClient(user: IServerUser, client: SUPPORTED_CLIENT):IClientUser{
    if(user){
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
            clients: Object.keys(user?.clientsData || {}) as SUPPORTED_CLIENT[]
        }
    }

    return undefined;
}

export function getSearchFromUrl(search = ''): Record<string, string>{
    let pairs = search.substring(1).split("&")
    let obj:Record<string, string> = {};
    let pair: string[];
    let i: string;

    for (i in pairs) {
        if (pairs[i] === "") continue;
        pair = pairs[i].split("=");
        const key = decodeURIComponent(pair[0]);
        obj[key] = decodeURIComponent(pair[1]);
    }

    return obj;
}
