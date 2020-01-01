import {IApp, IServerUser, IStorageKeyWithData, IUserData, SUPPORTED_CLIENT} from "../typings/index";
import {randomAvatar} from "../ui/src/components/avatar-customizer/avatar-options";
import server from "./server";

export interface IStorage {
    addUser: (storageKeysWithData?: IStorageKeyWithData[]) => Promise<IServerUser>
    deleteUser: (userId: string) => Promise<IApp>
    setUserData: (userId: string, storageKeysWithData: IStorageKeyWithData[], client: SUPPORTED_CLIENT) => Promise<IServerUser>
    clearUser: (userId: string) => Promise<IApp>
    getUser: (userId: string) => Promise<IServerUser>
    getUsers: () => Promise<IServerUser[]>
    clearApp: () => Promise<IApp>
}

function getNewUser(clientsData?: IUserData): IServerUser {
    let newUser: IServerUser = {
        name: 'Ny användare',
        id: ID(),
        avatar: randomAvatar(),
        clientsData: {} as IUserData
    };

    if(clientsData){
        newUser.clientsData = clientsData;
    }

    return newUser;
}

function ID(): string {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function getInitialState(){
    const newUser = getNewUser();
    return  {
        users: [newUser]
    };
}

async function addUser(data?: any): Promise<IServerUser> {
    console.log("addUser")
    const appData = await server.getData();
    const newUser = getNewUser(data);
    appData.users.push(newUser);
    await server.setData(appData);

    return getUser(newUser.id);
}

async function deleteUser(userId: string): Promise<IApp> {
    console.log("deleteUser", userId);
    const appData = await server.getData();
    const index = appData.users.findIndex(({ id }) => userId === id);
    console.log(index)
    if(index > -1){
        appData.users.splice(index, 1);
    }
    console.log(appData.users)
    return server.setData(appData);
}

async function setUserData(userId: string, storageKeysWithData: IStorageKeyWithData[], client: SUPPORTED_CLIENT): Promise<IServerUser> {
    console.log("setUserData", userId, storageKeysWithData, client);
    const appData = await server.getData();
    const index = appData.users.findIndex(({ id }) => id === userId);
    appData.users[index].clientsData[client] = storageKeysWithData;
    await server.setData(appData);

    return getUser(userId);
}

function getUsers(): Promise<IServerUser[]> {
    console.log("getUsers")
    return server.getData()
        .then((app: IApp) => {
            return app.users;
        })
}

function getUser(userId: string): Promise<IServerUser> {
    console.log("getUser", userId)
    return server.getData()
        .then((app: IApp) => {
            return app.users.find(({ id }) => id === userId);
        })
}

function clearUser(userId: string): Promise<IApp> {
    console.log("clearUser", userId)
    return server.getData()
        .then((app: IApp) => {
            const index = app.users.findIndex(({ id }) => id === userId);
            delete app.users[index].clientsData;

            return app;
        })
        .then(server.setData)
}

function clearApp(): Promise<IApp> {
    console.log("clearApp")
    return server.setData({users: []})
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
