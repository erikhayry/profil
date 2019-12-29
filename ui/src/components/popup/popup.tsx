import * as React from "react";
import {useEffect, useState} from "react";
import {Sliders} from 'react-feather';
import styles from './popup.module.css';
import storage from '../../../../utils/storage'
import Avatar from "avataaars";
import classNames from 'classnames';
// @ts-ignore
import browser from 'webextension-polyfill';
import {IUser, MESSAGE_TYPE} from "../../../../typings/index";
import useCurrentUser from "../../../utils/onMessage";
import {Emotion, withEmotion} from "../avatar-customizer/emotion-converter";

interface IView {
    users: IUser[],
    currentUser?: string
}

export const Popup = () => {
    const [view, setView ] = useState<IView>({
        users: [],
    });
    const currentUser = useCurrentUser();

    useEffect(() => {
        console.log("currentUser", currentUser);
        if(currentUser){
            setView({
                ...view,
                currentUser
            })
        }
    }, [currentUser]);

    useEffect(() => {
        console.log('useEffect')
        async function init() {
            const { users } = await storage.getData();
            setView({
                users
            });
            browser.runtime.sendMessage({type: MESSAGE_TYPE.REQUEST_CURRENT_USER});
        }

        init();
    }, []);

    function handleSetCurrentUser(userId: string){
        setView({
            ...view,
            currentUser: userId
        });
        browser.runtime.sendMessage({type: MESSAGE_TYPE.CURRENT_USER_FORM_UI, userId});
        window.close();
    }

    async function clearUser(userId: string) {
        console.log("clearUser", userId)
        storage.clearUser(userId)
    }
    
    return(
        <div className={styles.container}>
            <h1 className={classNames({
                [styles.title]: true
            })}>Profiler</h1>
            {!currentUser && <div className={styles.info}>Laddar / webbsida stöds ej</div>}
            {<ul className={styles.userList}>
                {view.users.map(user => {
                    const userListItemClasses = classNames({
                        [styles.userListItem]: true,
                        [styles.isCurrent]: user.id === view.currentUser,
                        [styles.isLegit]: Boolean(currentUser)
                    });
                    return (
                        <li className={userListItemClasses}>
                            <button
                                className={styles.avatarButton}
                                disabled={!currentUser}
                                onClick={() =>
                                    handleSetCurrentUser(user.id)
                                }
                            >
                                <Avatar
                                    avatarStyle='transparent'
                                    {...withEmotion(user.avatar, Boolean(currentUser) ? undefined : Emotion.SAD)}
                                />
                            </button>
                            <div className={styles.name}>{user.name}</div>
                            <button onClick={() => {
                                clearUser(user.id)
                            }}>Clear</button>
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
