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
    },
    {
        origins: ['https://urplay.se', 'urplay.se'],
        id: SUPPORTED_CLIENT.UR,
        dataKeys: ['ProgressTracker']
    },
    {
        origins: ['https://sverigesradio.se', 'sverigesradio.se'],
        id: SUPPORTED_CLIENT.SR,
        dataKeys: ['listen-later']
    },
    {
        origins: ['https://www.svt.se'],
        id: SUPPORTED_CLIENT.SVT_BARN,
        dataKeys: ['bp_global', 'bp_episodedata', 'bp_videosettings', 'bp_historylist']
    }
];

export function getClient(origin: string): IClientOrigins {
    console.log("origin", origin)
    return CLIENT_ORIGINS.find(({ origins }) => origins.includes(origin));
}
