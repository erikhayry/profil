import {SUPPORTED_CLIENT} from "../typings/index";

interface IClientOrigins {
    origins: string[],
    id: SUPPORTED_CLIENT,
    dataKeys: string[]
}

export const CLIENT_ORIGINS: IClientOrigins[] = [
    {
        origins: ['https://www.svtplay.se', 'www.svtplay.se'],
        id: SUPPORTED_CLIENT.SVT,
        dataKeys: ['persistent_state']
    }
];

export function getClient(origin: string): IClientOrigins {
    console.log("origin", origin)
    return CLIENT_ORIGINS.find(({ origins }) => origins.includes(origin));
}
