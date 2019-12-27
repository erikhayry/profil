import {IApp, IUser} from "../typings/index";
import {randomAvatar} from "../ui/src/components/avatar-customizer/avatar-options";

const browser = require("webextension-polyfill");

export interface IStorage {
    getData: () => Promise<IApp>;
    setData: (app: IApp) => Promise<IApp>;
    addUser: (data?: any) => Promise<IUser>
    deleteUser: (userId: string) => Promise<IApp>
    setUserData: (userId: string, data: any) => Promise<IUser>
    clearUser: (userId: string) => Promise<IApp>
    getUser: (userId: string) => Promise<IUser>
    clearApp: () => Promise<IApp>
}

interface IAppStorageData {
    app?: IApp
}

function getNewUser(data?: any): IUser {
    let newUser: IUser = {
        name: 'Ny användare',
        id: ID(),
        avatar: randomAvatar()
    };

    if(data){
        newUser.data = data;
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

async function addUser(data?: any): Promise<IUser> {
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
    if(index){
        appData.users.splice(index, 1);
    }
    return setData(appData);
}

async function setUserData(userId: string, data: any): Promise<IUser> {
    console.log("setUserData", userId, data);
    const appData = await getData();
    const index = appData.users.findIndex(({ id }) => id === userId);
    appData.users[index].data = data;
    await setData(appData);

    return getUser(userId);
}

function getUser(userId: string): Promise<IUser> {
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
            delete app.users[index].data;

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
