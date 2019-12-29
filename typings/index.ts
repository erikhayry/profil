import {IAvatarAttributes} from "../ui/src/components/avatar-customizer/avatar-options";

export enum MESSAGE_TYPE {
    INIT_APP = 'init',
    ADD_DATA_FOR_USER = 'data',
    REQUEST_CURRENT_USER = 'requestCurrentUser',
    CURRENT_USER = 'currentUser',
    CURRENT_USER_FROM_BACKGROUND = 'currentUserBackground',
    CURRENT_USER_FORM_UI = 'currentUserUi'
}

export enum SUPPORTED_CLIENT {
    SVT= 'svt',
    UR = 'UR',
    SVT_BARN = 'svt_barn',
    SR = 'sr'
}

export interface IClientData {
    data?: any
    dataUpdated?: number
}

export type IUserData = Map<SUPPORTED_CLIENT, IClientData>

export interface IClientUser {
    id: string;
    name: string;
    avatar: IAvatarAttributes;
    data?: any
}

export interface IServerUser {
    id: string;
    name: string;
    avatar: IAvatarAttributes;
    data: IUserData
}
export interface IApp {
    users: IServerUser[];
}

