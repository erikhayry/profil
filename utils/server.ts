import {IApp} from "../typings/index";
import { browser } from "webextension-polyfill-ts";
import {isDiff} from "./data-handler";

export interface IServer {
    getData: () => Promise<IApp>;
    setData: (app: IApp) => Promise<IApp>;
}

interface IAppStorageData {
    app?: IApp
}

function getInitialApp():IApp{
    return {
        users: []
    }
}

async function getData(): Promise<IApp> {
    console.info("getData");
    const { app } = await browser.storage.sync.get('app');

    return  app ? app : getInitialApp()
}

async function setData(app: IApp): Promise<IApp> {
    console.info("setData", app);
    const prevServerApp = await getData();

    if(isDiff(prevServerApp, app)){
        console.info("data set", prevServerApp, app);
        await browser.storage.sync.set({ app })
    }

    return getData();
}

const server: IServer = {
    getData,
    setData,
};

export default server;
