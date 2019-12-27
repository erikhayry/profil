import {IAvatarAttributes} from "../ui/src/components/avatar-customizer/avatar-options";

export enum MESSAGE_TYPE {
    INIT = 'init',
    SET_DATA = 'data',
    CURRENT_USER_FROM_BACKGROUND = 'currentUserBackground',
    REQUEST_CURRENT_USER = 'requestCurrentUser',
    CURRENT_USER = 'currentUser',
    CURRENT_USER_FORM_UI = 'currentUserUi',
    SYNC_USER = 'syncUser'
}

export interface IUser {
    id: string;
    name: string;
    avatar: IAvatarAttributes;
    data?: any;
    dataUpdated?: number;
}
export interface IData {
    users: IUser[];
}

