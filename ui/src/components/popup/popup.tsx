import * as React from "react";
import { Sliders } from 'react-feather';
import styles from './popup.module.css';
import {useEffect, useState} from "react";
import storage, {IData, IUser} from '../../../../utils/storage'
import {Editor} from "../editor/editor";
import Avatar from "avataaars";
import classNames from 'classnames';
// @ts-ignore
import browser from 'webextension-polyfill';
import {MESSAGE_TYPE} from "../../../../scripts/background";

export const Popup = () => {
    const [config, setConfig ] = useState<IData>({
        currentUser: undefined,
        users: []
    });
    const [editUser, setEditUser] = useState<IUser | undefined>(undefined);

    useEffect(() => {
        console.log('useEffect')
        storage.getData()
            .then(updateView)
    }, []);

    function updateView({ currentUser, users }: IData){
        console.log("updateView", currentUser, users )
        setConfig({
            currentUser, users
        });
    }

    function addUser() {
        console.log("addUser");
        storage.addUser()
            .then(updateView);
    }

    async function setCurrentUser(userId: string) {
        console.log("setCurrentUser", userId)
        const currentUser = await storage.getUser(userId);
        console.log(" - currentUser", currentUser)
        browser.runtime.sendMessage({type: MESSAGE_TYPE.CURRENT_USER, data: currentUser});
        storage.setCurrentUser(userId)
            .then(updateView);
    }

    async function clearCurrentUser(userId: string) {
        console.log("clearCurrentUser", userId)
        storage.clearCurrentUser(userId)
    }

    function onCloseEditor() {
        setEditUser(undefined)
    }

    function removeUser(userId: string){
        console.log("removeUser", userId);
        const index = config.users.findIndex(({ id }) => userId === id);
        config.users.splice(index, 1);

        //if(userId === config.currentUser){
            config.currentUser = config.users[0].id;
        //}

        storage.setData(config)
            .then(updateView);
    }

    function onUpdateUser(editedUser: IUser){
        console.log("onUpdateUser", editedUser);
        const index = config.users.findIndex(({ id }) => editUser.id === id);
        config.users[index] = editedUser;

        setEditUser(undefined);
        storage.setData(config)
            .then(updateView);
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
                        [styles.isCurrent]: user.id === config.currentUser
                    });
                    return (
                        <li className={userListItemClasses}>
                            <button className={styles.avatarButton} onClick={() =>
                                setCurrentUser(user.id)
                            }>
                                <Avatar
                                    avatarStyle='transparent'
                                    {...user.avatar}
                                />
                            </button>
                            <div className={styles.name}>{user.name}</div>
                            <button onClick={() => {
                                clearCurrentUser(user.id)
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
