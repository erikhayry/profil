import {IApp, IServerUser, IStorageKeyWithData, IUserData, SUPPORTED_CLIENT} from "../typings/index";
import {randomAvatar} from "../ui/src/components/avatar-customizer/avatar-options";
import server, {getNewUser} from "./server";

export interface IStorage {
    addUser: (storageKeysWithData?: IStorageKeyWithData[]) => Promise<IServerUser>
    deleteUser: (userId: string) => Promise<IApp>
    setUserData: (userId: string, storageKeysWithData: IStorageKeyWithData[], client: SUPPORTED_CLIENT) => Promise<IServerUser>
    clearUser: (userId: string) => Promise<IApp>
    getUser: (userId: string) => Promise<IServerUser>
    getUsers: () => Promise<IServerUser[]>
    clearApp: () => Promise<IApp>
}

async function addUser(data?: any): Promise<IServerUser> {
    const appData = await server.getData();
    const newUser = getNewUser(data);
    appData.users.push(newUser);
    await server.setData(appData);

    ga('send', 'event', 'Storage', 'add');

    return getUser(newUser.id);
}

async function deleteUser(userId: string): Promise<IApp> {
    const appData = await server.getData();
    const index = appData.users.findIndex(({ id }) => userId === id);
    if(index > -1){
        appData.users.splice(index, 1);
    }
    ga('send', 'event', 'Storage', 'remove');
    return server.setData(appData);
}

async function setUserData(userId: string, storageKeysWithData: IStorageKeyWithData[], client: SUPPORTED_CLIENT): Promise<IServerUser> {
    const appData = await server.getData();
    const index = appData.users.findIndex(({ id }) => id === userId);
    appData.users[index].clientsData[client] = storageKeysWithData;
    await server.setData(appData);

    return getUser(userId);
}

function getUsers(): Promise<IServerUser[]> {
    return server.getData()
        .then((app: IApp) => {
            return app ? app.users : [];
        })
}

function getUser(userId: string): Promise<IServerUser> {
    return server.getData()
        .then((app: IApp) => {
            return app?.users.find(({ id }) => id === userId);
        })
}

function clearUser(userId: string): Promise<IApp> {
    return server.getData()
        .then((app: IApp) => {
            const index = app.users.findIndex(({ id }) => id === userId);
            app.users[index].clientsData = {};
            return app;
        })
        .then(server.setData)
}

function clearApp(): Promise<IApp> {
    return server.setData(undefined)
        .then(server.getData)
}

const storage: IStorage = {
    getUsers,
    addUser,
    setUserData,
    getUser,
    clearUser,
    clearApp,
    deleteUser,
};

export default storage;
