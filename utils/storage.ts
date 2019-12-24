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
    currentUser: string
}

export interface IStorage {
    getData: () => Promise<IData>;
    setData: (app: IData) => Promise<IData>;
    addUser: (data?: any) => Promise<IUser>
    setCurrentUser: (userId: string) => Promise<IUser>
    getCurrentUser: () => Promise<IUser>
    setUserData: (userId: string, data: any) => Promise<IData>
    clearCurrentUser: (userId: string) => Promise<IData>
    getUser: (userId: string) => Promise<IUser>
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
        users: [newUser],
        currentUser: newUser.id
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
    console.log("setData", app)
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

function setUserData(userId: string, data: any): Promise<IData> {
    console.log("setUserData", userId, data)
    return getData()
        .then((app: IData) => {
            const index = app.users.findIndex(({ id }) => id === userId);
            app.users[index].data = data;
            app.users[index].dataUpdated = new Date().getTime();

            return app;
        })
        .then(setData)
}

function getUser(userId: string): Promise<IUser> {
    console.log("getUser", userId)
    return getData()
        .then((app: IData) => {
            return app.users.find(({ id }) => id === userId);
        })
}

async function setCurrentUser(userId: string): Promise<IUser> {
    console.log("setCurrentUser", userId)
    const appData = await getData();
    appData.currentUser = userId;
    await setData(appData);

    return getCurrentUser();
}

function getCurrentUser(): Promise<IUser> {
    console.log("getCurrentUser")
    return getData()
        .then(({ currentUser, users }) => {
            return users.find(({ id }) => id === currentUser);
        })
}

function clearCurrentUser(userId: string): Promise<IData> {
    console.log("clearCurrentUser", userId)
    return getData()
        .then((app: IData) => {
            const index = app.users.findIndex(({ id }) => id === userId);
            delete app.users[index].data;

            return app;
        })
        .then(setData)
}

const storage: IStorage = {
    getData,
    setData,
    addUser,
    setCurrentUser,
    getCurrentUser,
    setUserData,
    getUser,
    clearCurrentUser
};

export default storage;
