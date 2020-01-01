import {IApp} from "../typings/index";
import { browser } from "webextension-polyfill-ts";

export interface IServer {
    getData: () => Promise<IApp>;
    setData: (app: IApp) => Promise<IApp>;
}

interface IAppStorageData {
    app?: IApp
}

function getData(): Promise<IApp> {
    console.log("getData")
    return browser.storage.sync.get('app')
        .then(({ app }: IAppStorageData) => {
            return app;
        })
}

function setData(app: IApp): Promise<IApp> {
    console.log("setData", app);
    return browser.storage.sync.set({ app })
        .then(getData)
}

const server: IServer = {
    getData,
    setData,
};

export default server;
