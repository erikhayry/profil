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
    console.info("getData");
    return browser.storage.sync.get('app')
        .then(({ app }: IAppStorageData) => {
            return app ? app : { users: []}
        })
}

function setData(app: IApp): Promise<IApp> {
    console.info("setData", app);
    return browser.storage.sync.set({ app })
        .then(getData)
}

const server: IServer = {
    getData,
    setData,
};

export default server;
