import * as React from "react";
import { Sliders } from 'react-feather';
import styles from './popup.module.css';
import {useEffect, useState} from "react";
import storage, {IData, IUser} from '../../../../utils/storage'
import Avatar from "avataaars";
import classNames from 'classnames';
// @ts-ignore
import browser from 'webextension-polyfill';
import {MESSAGE_TYPE} from "../../../../scripts/background";

interface IView {
    users: IUser[],
    currentUser?: string
}

export const Popup = () => {
    const [view, setView ] = useState<IView>({
        users: [],
    });

    useEffect(() => {
        console.log('useEffect')
        async function setView() {
            await getUsers();
            await updateView();
        }

        setView();
    }, []);

    async function updateView(){
        browser.runtime.sendMessage({type: MESSAGE_TYPE.REQUEST_CURRENT_USER});
        browser.runtime.onMessage.addListener( ({ type, userId } : { type: MESSAGE_TYPE, userId: string}) => {
            console.log('message', type, userId);
            console.log('view', view);
            setView({
                ...view,
                currentUser: userId
            });
        });
    }
    async function getUsers(){
        const { users } = await storage.getData();
        console.log('getUsers', users);
        setView({
            ...view,
            users: users
        });
    }

    function handleSetCurrentUser(userId: string){
        setView({
            ...view,
            currentUser: userId
        });
        browser.runtime.sendMessage({type: MESSAGE_TYPE.CURRENT_USER_FORM_UI, data: userId});
    }

    async function clearUser(userId: string) {
        console.log("clearUser", userId)
        storage.clearUser(userId)
    }
    
    return(
        <div className={styles.container}>
            <ul className={styles.userList}>
                <li className={classNames({
                  [styles.userListItem]: true,
                  [styles.title]: true
                })}>Profiler</li>
                {view.users.map(user => {
                    const userListItemClasses = classNames({
                        [styles.userListItem]: true,
                        [styles.isCurrent]: user.id === view.currentUser
                    });
                    return (
                        <li className={userListItemClasses}>
                            <button className={styles.avatarButton} onClick={() =>
                                handleSetCurrentUser(user.id)
                            }>
                                <Avatar
                                    avatarStyle='transparent'
                                    {...user.avatar}
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
            </ul>
        </div>
    )
};
