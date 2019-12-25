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

export const Popup = () => {
    const [config, setConfig ] = useState<IData>({
        users: []
    });
    const [currentUser, setCurrentUser] = useState<string>(undefined)

    useEffect(() => {
        console.log('useEffect')
        updateView();
    }, []);

    async function updateView(){
        const {users} = await storage.getData();
        setConfig({
            users
        });
    }

    function handleSetCurrentUser(userId: string){
        setCurrentUser(userId);
        browser.runtime.sendMessage({type: MESSAGE_TYPE.CURRENT_USER, data: userId});
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
                {config.users.map(user => {
                    const userListItemClasses = classNames({
                        [styles.userListItem]: true,
                        [styles.isCurrent]: user.id === currentUser
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

function handleMessage({type, data}: {type: MESSAGE_TYPE, data: any} ){
    console.log('handleMessage', type, data);
}


browser.runtime.onMessage.addListener(handleMessage);
