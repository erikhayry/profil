import {IApp, IServerUser, IUserData} from "../typings/index";
import { browser } from "webextension-polyfill-ts";
import {isDiff} from "./data-handler";
import {randomAvatar} from "../ui/src/components/avatar-customizer/avatar-options";

export interface IServer {
    getData: () => Promise<IApp>;
    setData: (app: IApp) => Promise<IApp>;
}

export function getNewUser(clientsData?: IUserData): IServerUser {
    let newUser: IServerUser = {
        name: 'Ny användare',
        id: ID(),
        avatar: randomAvatar(),
        clientsData: {} as IUserData,
        created: new Date().getTime()
    };

    if(clientsData){
        newUser.clientsData = clientsData;
    }

    return newUser;
}

function ID(): string {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function getInitialApp(){
    const newUser = getNewUser();
    return  {
        users: [newUser]
    };
}

async function getData(): Promise<IApp> {
    const { app } = await browser.storage.local.get('app');
    console.info("getData", app);

    if(app){
        return app;
    }

    const initialApp = getInitialApp();
    await browser.storage.local.set({ app: getInitialApp() })

    return initialApp;
}

async function setData(app: IApp): Promise<IApp> {
    console.info("setData", app);
    const prevServerApp = await getData();

    if(isDiff(prevServerApp, app)){
        console.info("data set", prevServerApp, app);
        await browser.storage.local.set({ app })
    }

    return getData();
}

const server: IServer = {
    getData,
    setData,
};

export default server;
