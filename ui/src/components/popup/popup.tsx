import * as React from "react";
import {useEffect, useState} from "react";
import {Sliders} from 'react-feather';
import styles from './popup.module.css';
import storage from '../../../../utils/storage'
import classNames from 'classnames';
import { browser } from "webextension-polyfill-ts";
import {IServerUser, MESSAGE_TYPE, SUPPORTED_CLIENT} from "../../../../typings/index";
import useInitialClientState from "../../../utils/onMessage";
import {Emotion, withEmotion} from "../avatar-customizer/emotion-converter";
import {ProfilAvatar} from "../avatar/profil-avatar";
import {Title} from "../title/title";

interface IView {
    users: IServerUser[],
    currentUser?: IServerUser,
    clientId?: SUPPORTED_CLIENT
}

export const Popup = () => {
    const [view, setView ] = useState<IView>({
        users: []
    });
    const initialClientState = useInitialClientState();

    useEffect(() => {
        console.log("initialClientState", initialClientState);
        setView({
            ...view,
            currentUser: view.users.find(user => user.id === initialClientState.currentUser),
            clientId: initialClientState?.clientId
        })
    }, [initialClientState]);

    useEffect(() => {
        console.log('useEffect')
        async function init() {
            const users = await storage.getUsers();
            setView({
                ...view,
                users
            });
            browser.runtime.sendMessage({type: MESSAGE_TYPE.REQUEST_INITIAL_STATE, clientId: view.clientId});
        }

        init();
    }, []);

    function handleSetCurrentUser(userId: string){
        setView({
            ...view,
            currentUser: view.users.find(user => user.id === userId)
        });
        browser.runtime.sendMessage({type: MESSAGE_TYPE.CURRENT_USER_FORM_UI, userId, clientId: view.clientId});
        window.close();
    }

    async function clearUser(userId: string) {
        console.log("clearUser", userId)
        storage.clearUser(userId)
    }

    const isLegit = Boolean(view.clientId);
    
    return(
        <div className={styles.container}>
            <div className={styles.header}>
                <Title title={'Profil'} />
            </div>
            {!isLegit && <div className={styles.info}>Laddar / webbsida stöds ej</div>}
            {<ul className={styles.userList}>
                {view.currentUser &&
                    <li className={classNames({
                        [styles.userListItem]: true,
                        [styles.isCurrent]: true,
                        [styles.isLegit]: isLegit
                    })}>
                        <button
                            className={styles.avatarButton}
                            disabled={true}
                        >
                            <ProfilAvatar
                                attributes={withEmotion(view.currentUser.avatar, isLegit ? undefined : Emotion.SAD)}
                            />
                        </button>
                        <div className={styles.name}>{view.currentUser.name}</div>
                    </li>
                }
                {view.users
                    .filter(user => {
                        if(!view.currentUser) {
                            return true
                        }

                        return view.currentUser.id !== user.id
                    })
                    .map(user => {
                    const userListItemClasses = classNames({
                        [styles.userListItem]: true,
                        [styles.isLegit]: isLegit
                    });
                    return (
                        <li className={userListItemClasses}>
                            <button
                                className={styles.avatarButton}
                                disabled={!isLegit}
                                onClick={() =>
                                    handleSetCurrentUser(user.id)
                                }
                            >
                                <ProfilAvatar
                                    attributes={withEmotion(user.avatar, isLegit ? undefined : Emotion.SAD)}
                                />
                            </button>
                            <div className={styles.name}>{user.name}</div>
                        </li>
                    )
                })}
                <li className={classNames({
                    [styles.userListItem]: true,
                    [styles.menu]: true
                })}>
                    <button className={styles.settingsBtn} onClick={() => {
                        browser.runtime.openOptionsPage();
                    }}>
                        <Sliders color="white"/>
                    </button>
                </li>
            </ul>}
        </div>
    )
};
