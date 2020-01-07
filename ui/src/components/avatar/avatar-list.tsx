import * as React from "react";
import {useEffect, useState} from "react";
import styles from './avatar-list.module.css';
import storage from '../../../../utils/storage'
import {IServerUser} from "../../../../typings/index";
import timeMachine from "../avatar-customizer/time-machine";
import {ProfilAvatar} from "./profil-avatar";
import { CSSTransition } from "react-transition-group";

interface ViewState {
    users: IServerUser[]
}

interface IProps {
    onClick: (id: string) => void
}

export const AvatarList: React.FC<IProps>= ({onClick}) => {
    const [view, setView ] = useState<ViewState>({
        users: []
    });

    useEffect(() => {
        console.log('useEffect');
        storage.getUsers()
            .then((users) => setView({
                ...view,
                users
            }));
    }, []);


    return(
            <ul className={styles.userList}>
                {view.users.reverse().map((user, index) => {
                    return (
                        <CSSTransition
                            in={true}
                            appear={true}
                            timeout={index * 100}
                            mountOnEnter
                            unmountOnExit
                            classNames={{
                                appear: styles.userListItemAppear,
                                appearDone: styles.userListItemAppearDone,
                                enter: styles.userListItemEnter,
                                enterActive: styles.userListItemEnterActive,
                                exit: styles.userListItemExit,
                                exitActive: styles.userListItemExitActive
                            }}
                        >
                            <li className={styles.userListItem} key={user.id}>
                                <button className={styles.avatarButton} onClick={() => onClick(user.id)}>
                                    <ProfilAvatar
                                        attributes={timeMachine(user.avatar)}
                                    />
                                </button>
                                <h2 className={styles.name}>{user.name}</h2>
                            </li>
                        </CSSTransition>
                    )
                })}
            </ul>
    )
};
