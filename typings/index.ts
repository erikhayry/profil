import {IAvatarAttributes} from "../ui/src/components/avatar-customizer/avatar-options";

export enum MESSAGE_TYPE {
    INIT_APP = 'init',
    ADD_DATA_FOR_USER = 'data',
    REQUEST_CURRENT_USER = 'requestCurrentUser',
    CURRENT_USER = 'currentUser',
    CURRENT_USER_FROM_BACKGROUND = 'currentUserBackground',
    CURRENT_USER_FORM_UI = 'currentUserUi'
}

export interface IUser {
    id: string;
    name: string;
    avatar: IAvatarAttributes;
    data?: any;
    dataUpdated?: number;
}
export interface IApp {
    users: IUser[];
}

