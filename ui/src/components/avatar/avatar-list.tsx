import * as React from "react";
import {useEffect, useState} from "react";
import styles from './avatar-list.module.css';
import storage from '../../../../utils/storage'
import {IServerUser} from "../../../../typings/index";
import timeMachine from "../avatar-customizer/time-machine";
import {ProfilAvatar} from "./profil-avatar";
import { CSSTransition } from "react-transition-group";
import {Emotion, withEmotion} from "../avatar-customizer/emotion-converter";

interface ViewState {
    users: IServerUser[],
    currentHoveredUserId?: string
}

interface IProps {
    onClick: (id: string) => void
}

export const AvatarList: React.FC<IProps>= ({onClick}) => {
    const [view, setView ] = useState<ViewState>({
        users: [],
    });

    useEffect(() => {
        console.log('useEffect');
        storage.getUsers()
            .then((users) => setView({
                ...view,
                users
            }));
    }, []);

    function onBtnMouseEvent(event:React.MouseEvent<HTMLElement>, userId: string){
        if(event.type === "mouseenter"){
            setView({
                ...view,
                currentHoveredUserId: userId
            })
        } else {
            setView({
                ...view,
                currentHoveredUserId: undefined
            })
        }
    }


    return(
            <ul className={styles.userList}>
                {view.users.map((user, index) => {
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
                                <button
                                    className={styles.avatarButton}
                                    onClick={() => onClick(user.id)}
                                    onMouseEnter={(event) => {
                                        onBtnMouseEvent(event, user.id)
                                    }}
                                    onMouseLeave={(event) => {
                                        onBtnMouseEvent(event, user.id)
                                    }}
                                >
                                    <ProfilAvatar
                                        attributes={timeMachine(withEmotion(user.avatar, user.id === view.currentHoveredUserId ? Emotion.HAPPY : null))}
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
