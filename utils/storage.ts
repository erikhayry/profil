import {IApp, IClientData, IServerUser, IStorageKeyWithData, IUserData, SUPPORTED_CLIENT} from "../typings/index";
import {randomAvatar} from "../ui/src/components/avatar-customizer/avatar-options";
import { browser } from "webextension-polyfill-ts";

export interface IStorage {
    getData: () => Promise<IApp>;
    setData: (app: IApp) => Promise<IApp>;
    addUser: (storageKeysWithData?: IStorageKeyWithData[]) => Promise<IServerUser>
    deleteUser: (userId: string) => Promise<IApp>
    setUserData: (userId: string, storageKeysWithData: IStorageKeyWithData[], client: SUPPORTED_CLIENT) => Promise<IServerUser>
    clearUser: (userId: string) => Promise<IApp>
    getUser: (userId: string) => Promise<IServerUser>
    clearApp: () => Promise<IApp>
}

interface IAppStorageData {
    app?: IApp
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

function getData(): Promise<IApp> {
    console.log("getData")

    return browser.storage.sync.get('app')
        .then(({ app }: IAppStorageData) => {
            if(!app){
                return setData(getInitialState());
            }
            return app;
        })
}

function setData(app: IApp): Promise<IApp> {
    console.log("setData", app);
    return browser.storage.sync.set({ app })
        .then(getData)
}

async function addUser(data?: any): Promise<IServerUser> {
    console.log("addUser")
    const appData = await getData();
    const newUser = getNewUser(data);
    appData.users.push(newUser);
    await setData(appData);

    return getUser(newUser.id);
}

async function deleteUser(userId: string): Promise<IApp> {
    console.log("deleteUser", userId);
    const appData = await getData();
    const index = appData.users.findIndex(({ id }) => userId === id);
    console.log(index)
    if(index > -1){
        appData.users.splice(index, 1);
    }
    console.log(appData.users)
    return setData(appData);
}

async function setUserData(userId: string, storageKeysWithData: IStorageKeyWithData[], client: SUPPORTED_CLIENT): Promise<IServerUser> {
    console.log("setUserData", userId, storageKeysWithData, client);
    const appData = await getData();
    const index = appData.users.findIndex(({ id }) => id === userId);
    appData.users[index].clientsData[client].storageKeysWithData = storageKeysWithData;
    await setData(appData);

    return getUser(userId);
}

function getUser(userId: string): Promise<IServerUser> {
    console.log("getUser", userId)
    return getData()
        .then((app: IApp) => {
            return app.users.find(({ id }) => id === userId);
        })
}

function clearUser(userId: string): Promise<IApp> {
    console.log("clearUser", userId)
    return getData()
        .then((app: IApp) => {
            const index = app.users.findIndex(({ id }) => id === userId);
            delete app.users[index].clientsData;

            return app;
        })
        .then(setData)
}

function clearApp(): Promise<IApp> {
    console.log("clearApp")
    return browser.storage.sync.clear()
        .then(getData)
}

const storage: IStorage = {
    getData,
    setData,
    addUser,
    setUserData,
    getUser,
    clearUser,
    clearApp,
    deleteUser,
};

export default storage;
