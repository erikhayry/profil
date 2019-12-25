import {IAvatarAttributes} from "../ui/src/components/avatar-customizer/avatar-options";

const browser = require("webextension-polyfill");

export interface IUser {
    id: string;
    name: string;
    avatar: IAvatarAttributes;
    data?: any;
    dataUpdated?: number;
}
export interface IData {
    users: IUser[];
}

export interface IStorage {
    getData: () => Promise<IData>;
    setData: (app: IData) => Promise<IData>;
    addUser: (data?: any) => Promise<IUser>
    setUserData: (userId: string, data: any) => Promise<IUser>
    clearUser: (userId: string) => Promise<IData>
    getUser: (userId: string) => Promise<IUser>
    clearApp: () => Promise<IData>
}

interface IAppStorageData {
    app?: IData
}

function getNewUser(data?: any): IUser {
    let newUser: IUser = {
        name: 'Ny användare',
        id: ID(),
        avatar: {
            topType:'LongHairMiaWallace',
            accessoriesType:'Prescription02',
            hairColor:'BrownDark',
            facialHairType:'Blank',
            clotheType:'Hoodie',
            clotheColor:'PastelBlue',
            eyeType:'Happy',
            eyebrowType:'Default',
            mouthType:'Smile',
            skinColor:'Light',
        }
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

function getData(): Promise<IData> {
    console.log("getData")

    return browser.storage.sync.get('app')
        .then(({ app }: IAppStorageData) => {
            if(!app){
                return setData(getInitialState());
            }
            return app;
        })
}

function setData(app: IData): Promise<IData> {
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

async function setUserData(userId: string, data: any): Promise<IUser> {
    console.log("setUserData", userId, data);
    const appData = await getData();
    const index = appData.users.findIndex(({ id }) => id === userId);
    appData.users[index].data = data;
    appData.users[index].dataUpdated = new Date().getTime();
    await setData(appData);

    return getUser(userId);
}

function getUser(userId: string): Promise<IUser> {
    console.log("getUser", userId)
    return getData()
        .then((app: IData) => {
            return app.users.find(({ id }) => id === userId);
        })
}

function clearUser(userId: string): Promise<IData> {
    console.log("clearUser", userId)
    return getData()
        .then((app: IData) => {
            const index = app.users.findIndex(({ id }) => id === userId);
            delete app.users[index].data;

            return app;
        })
        .then(setData)
}

function clearApp(): Promise<IData> {
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
};

export default storage;
