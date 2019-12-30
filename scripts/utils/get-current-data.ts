import {IServerUser, IStorageKeyWithData, SUPPORTED_CLIENT} from "../../typings/index";
import storage from "../../utils/storage";

export async function getCurrentUserData(client: SUPPORTED_CLIENT, clientStorageKeysWithData: IStorageKeyWithData[], clientUserId?:string): Promise<IServerUser> {
    console.log('getCurrentUserData', clientUserId, clientStorageKeysWithData);
    const { users } = await storage.getData();
    console.log("users", users)
    const firstUser = users[0];
    const clientUserDataExists = clientStorageKeysWithData.some(({data}) => data);
    console.log('clientUserDataExists', clientUserDataExists)
    const serverUserDataExists = users.some(user => user.clientsData[client]?.some(({ data }) => data));
    console.log('serverUserDataExists', serverUserDataExists)
    const unusedUser = users.find(user => !user.clientsData[client]);
    console.log('unusedUser', unusedUser)

    if(!clientUserId && !clientUserDataExists){
        //1.
        //Client: no data, no user.
        //Server: no data
        if(!serverUserDataExists){
            console.log('1');
            return Promise.resolve(firstUser);
        }

        //7.
        //Client: no data, no user.
        //Server: data
        console.log('7');
        return Promise.resolve(firstUser)

        //return storage.addUser();
    }

    if(!clientUserId && clientUserDataExists){
        //2.
        //Client: data, no user
        //Server no data
        //8.
        //Client: data, no user
        //Server: data
        if(unusedUser){
            console.log('2');
            console.log('8.1');
            return storage.setUserData(unusedUser.id, clientStorageKeysWithData, client);
        }
        console.log('8.2');
        return storage.addUser(clientStorageKeysWithData);

    }

    //if(clientUserId && !clientUserDataExists){
    //    const serverUserSetOnClient = await storage.getUser(clientUserId);
//
    //    //3.
    //    //Client: no data, valid user
    //    //Server: no data
    //    //9.
    //    //Client: no data, valid user
    //    //Server: data
    //    if(serverUserSetOnClient){
    //        console.log('3,9');
    //        return Promise.resolve(serverUserSetOnClient);
    //    }
//
    //    //5.
    //    //Client: no data. Invalid user
    //    //Server: no data
    //    if(!serverUserDataExists){
    //        console.log('5');
    //        return Promise.resolve(firstUser);
    //    }
    //    //11.
    //    //Client: no data. Invalid user
    //    //Server: data
    //    console.log('11');
    //    return Promise.resolve(firstUser)
    //}
//
    //if(clientUserId && clientUserDataExists){
    //    const serverUserSetOnClient = await storage.getUser(clientUserId);
//
    //    //4.
    //    //Client: data, valid user
    //    //Server: no data
    //    if(
    //        serverUserSetOnClient &&
    //        serverUserSetOnClient.clientsData[client]?.storageKeysWithData.every(({ data }) => !data) &&
    //        clientUserDataExists
    //    ){
    //        console.log('4')
    //        return storage.setUserData(serverUserSetOnClient.id, clientStorageKeysWithData, client);
    //    }
    //    if(
    //        serverUserSetOnClient &&
    //        serverUserSetOnClient.clientsData[client]?.storageKeysWithData.some(({ data }) => !data)
    //    ){
    //        //10.
    //        //Client: data, valid user
    //        //Server: data
    //        console.log('10')
    //        return Promise.resolve(serverUserSetOnClient);
    //    }
//
    //    if(!serverUserSetOnClient){
    //        //6
    //        //Client: data. Invalid user
    //        //Server: no data
    //        //12.
    //        //Client: data. Invalid user
    //        //Server: data
    //        console.log('6, 12');
    //        return Promise.resolve(firstUser);
    //    }
    //}
}
