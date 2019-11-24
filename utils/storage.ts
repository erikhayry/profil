const browser = require("webextension-polyfill");

export interface IUser {
    id: string;
    name: string;
    data?: any;
}
export interface IData {
    users: IUser[];
    currentUser: string
}

export interface IStorage {
    getData: () => Promise<IData>;
    setData: (app: IData) => Promise<IData>;
    addUser: () => Promise<IData>
    setCurrentUser: (userId: string) => Promise<IData>
    getCurrentUser: () => Promise<IUser>
    setUserData: (userId: string, data: any) => Promise<IData>
    getUser: (userId: string) => Promise<IUser>
}

interface IAppStorageData {
    app?: IData
}

function ID(): string {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function getInitialState(){
    const initialUser: IUser = {
        name: 'Ny användare',
        id: ID()
    };
    return  {
        users: [initialUser],
        currentUser: initialUser.id
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

function addUser(): Promise<IData> {
    console.log("addUser")
    return getData()
        .then((app: IData) => {
            app.users.push({
                id: ID(),
                name: 'Ny användare'
            });

            return app;
        })
        .then(setData)
}

function setUserData(userId: string, data: any): Promise<IData> {
    console.log("setUserData", userId, data)
    return getData()
        .then((app: IData) => {
            const index = app.users.findIndex(({ id }) => id === userId);
            app.users[index].data = data;

            return app;
        })
        .then(setData)
}

function getUser(userId: string): Promise<IUser> {
    console.log("getUser", userId)
    return getData()
        .then((app: IData) => {
            const index = app.users.findIndex(({ id }) => id === userId);
            return app.users[index];
        })
}

function setCurrentUser(userId: string): Promise<IData> {
    console.log("setCurrentUser", userId)
    return getData()
        .then((app: IData) => {
            app.currentUser = userId;
            return app;
        })
        .then(setData)
}

function getCurrentUser(): Promise<IUser> {
    console.log("getCurrentUser")
    return getData()
        .then(({ currentUser, users }) => {
            return users.find(({ id }) => id === currentUser);
        })
}

const storage: IStorage = {
    getData,
    setData,
    addUser,
    setCurrentUser,
    getCurrentUser,
    setUserData,
    getUser
};

export default storage;