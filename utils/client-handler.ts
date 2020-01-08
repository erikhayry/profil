import {SUPPORTED_CLIENT} from "../typings/index";

export interface IClientOrigins {
    origins: string[],
    id: SUPPORTED_CLIENT,
    url: string,
    name: string;
    imagePath: string,
    dataKeys: string[]
}

export const CLIENT_ORIGINS: IClientOrigins[] = [
    {
        origins: ['https://www.svtplay.se', 'www.svtplay.se'],
        id: SUPPORTED_CLIENT.SVT,
        url: 'https://www.svtplay.se',
        name: 'SVT',
        imagePath: '/static/svtplay-logo.png',
        dataKeys: ['persistent_state']
    },
    {
        origins: ['https://urplay.se', 'urplay.se'],
        id: SUPPORTED_CLIENT.UR,
        url: 'https://urplay.se',
        name: 'Ur Play',
        imagePath: '/static/ur-logo.svg',
        dataKeys: ['ProgressTracker']
    },
    {
        origins: ['https://sverigesradio.se', 'sverigesradio.se'],
        id: SUPPORTED_CLIENT.SR,
        url: 'https://sverigesradio.se',
        name: 'Sveriges Radio',
        imagePath: '/static/sr-logo.png',
        dataKeys: ['listen-later']
    },
    {
        origins: ['https://www.svt.se', "www.svt.se"],
        id: SUPPORTED_CLIENT.SVT_BARN,
        url: 'https://www.svt.se/barn',
        name: 'SVT Barn',
        imagePath: '/static/svtbarn-logo.svg',
        dataKeys: ['bp_global', 'bp_episodedata', 'bp_videosettings', 'bp_historylist']
    }
];

export function getClient(origin: string): IClientOrigins {
    return CLIENT_ORIGINS.find(({ origins }) => origins.includes(origin));
}
